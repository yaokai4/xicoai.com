import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { macOrders, macPaymentEvents } from "@/db/schema";
import { BRAND, constructWebhookEvent } from "@/lib/payment/stripe";
import { issueLicenseForOrder } from "@/lib/license/issue";
import { sendKeyEmail, notifySale } from "@/lib/license/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhook for Xico Clean. Register this endpoint on the (shared) Stripe
 * account — it has its own signing secret and fulfils ONLY sessions whose
 * metadata.brand === "xico-clean", so it safely ignores Shangence's events.
 *
 * Fulfilment is idempotent by construction (order status guard + the unique
 * license.order_id), so duplicate deliveries never double-issue.
 */
export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const raw = await req.text();
    event = constructWebhookEvent(raw, signature);
  } catch (e) {
    console.error("stripe webhook: bad signature", e);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const db = getDb();

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      // Only our product — this is what lets the account also serve Shangence.
      if (session.metadata?.brand !== BRAND) {
        return NextResponse.json({ received: true, ignored: true });
      }
      const orderNo = session.metadata?.orderNo || session.client_reference_id;
      if (orderNo) {
        await fulfil(session, orderNo);
        // Best-effort audit/dedupe ledger (fulfilment is already idempotent).
        await db
          .insert(macPaymentEvents)
          .values({ eventId: event.id, eventType: event.type, orderNo })
          .onConflictDoNothing();
      }
    } else if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderNo = session.metadata?.orderNo || session.client_reference_id;
      if (session.metadata?.brand === BRAND && orderNo) {
        await db
          .update(macOrders)
          .set({ status: "expired" })
          .where(eq(macOrders.orderNo, orderNo));
      }
    }
  } catch (e) {
    // Return 500 so Stripe retries a transient failure.
    console.error("stripe webhook: fulfilment error", e);
    return NextResponse.json({ error: "fulfilment failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function fulfil(session: Stripe.Checkout.Session, orderNo: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(macOrders)
    .where(eq(macOrders.orderNo, orderNo))
    .limit(1);
  const order = rows[0];
  if (!order) return; // not one of ours / already gone
  const email =
    session.customer_details?.email || session.customer_email || order.email;

  if (order.status !== "paid") {
    await db
      .update(macOrders)
      .set({
        status: "paid",
        paidAt: new Date(),
        email: email ?? order.email,
        providerPaymentIntent:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : (session.payment_intent?.id ?? null),
      })
      .where(eq(macOrders.id, order.id));
  }

  const paidOrder = { ...order, email: email ?? order.email };
  const key = await issueLicenseForOrder(paidOrder);

  if (paidOrder.email) {
    try {
      await sendKeyEmail({
        to: paidOrder.email,
        key,
        plan: order.plan,
        orderNo,
      });
    } catch (e) {
      console.error("sendKeyEmail failed (non-fatal)", e);
    }
  }
  try {
    await notifySale({
      plan: order.plan,
      email: paidOrder.email,
      orderNo,
      amount: order.amount,
      currency: order.currency,
    });
  } catch {
    /* non-fatal */
  }
}
