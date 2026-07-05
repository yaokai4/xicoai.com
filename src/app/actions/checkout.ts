"use server";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { macOrders } from "@/db/schema";
import { getMacPricing, planPricing } from "@/lib/pricing.server";
import { toMinorUnits, type PlanId } from "@/lib/pricing";
import {
  createCheckoutSession,
  stripeConfigured,
} from "@/lib/payment/stripe";

export type CheckoutState = { ok: boolean; url?: string; error?: string };

type Locale = "zh" | "ja" | "en";

const PLAN_LABEL: Record<PlanId, Record<Locale, string>> = {
  personal: { zh: "个人版", ja: "個人版", en: "Personal" },
  family: { zh: "家庭版", ja: "ファミリー版", en: "Family" },
};
const PLAN_DESC: Record<PlanId, Record<Locale, string>> = {
  personal: {
    zh: "1 台 Mac · 永久买断，长期免费更新",
    ja: "Mac 1台 · 買い切り、無料アップデート",
    en: "1 Mac · one-time purchase, free updates",
  },
  family: {
    zh: "最多 5 台 Mac · 永久买断，长期免费更新",
    ja: "最大5台 · 買い切り、無料アップデート",
    en: "Up to 5 Macs · one-time purchase, free updates",
  },
};

function normLocale(v: string | undefined): Locale {
  return v === "ja" || v === "en" ? v : "zh";
}

/**
 * Create a pending order + Stripe Checkout session for a plan and return the
 * hosted checkout URL. Called directly from the buy page client.
 */
export async function startCheckout(
  planRaw: string,
  localeRaw: string,
): Promise<CheckoutState> {
  const plan: PlanId = planRaw === "family" ? "family" : "personal";
  const locale = normLocale(localeRaw);

  const pricing = await getMacPricing();
  if (!pricing.active || !stripeConfigured()) {
    return { ok: false, error: "unavailable" };
  }
  const tier = planPricing(pricing, plan);
  const amount = toMinorUnits(tier.amount, pricing.currency);
  if (!amount || amount < 1) return { ok: false, error: "unavailable" };

  // Return URLs: keep the buyer on whatever host they came from (the mac
  // subdomain rewrites /buy → /mac/buy, so no /mac prefix is needed there).
  const h = await headers();
  const host = (h.get("x-forwarded-host") || h.get("host") || "mac.xicoai.com")
    .split(",")[0]
    .trim();
  const proto = (h.get("x-forwarded-proto") || "https").split(",")[0].trim();
  const origin = `${proto}://${host}`;
  const localeSeg = locale === "zh" ? "" : `/${locale}`;
  const base = host.startsWith("mac.")
    ? `${origin}${localeSeg}`
    : `${origin}${localeSeg}/mac`;

  const orderNo = randomBytes(16).toString("hex");

  try {
    const db = getDb();
    const inserted = await db
      .insert(macOrders)
      .values({
        orderNo,
        plan,
        amount,
        currency: pricing.currency,
        locale,
        status: "pending",
      })
      .returning();
    const order = inserted[0];

    const session = await createCheckoutSession({
      order,
      productName: `Xico Clean — ${PLAN_LABEL[plan][locale]}`,
      productDescription: PLAN_DESC[plan][locale],
      locale,
      successUrl: `${base}/buy/success?order_no=${orderNo}&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${base}/buy?canceled=1`,
    });

    await db
      .update(macOrders)
      .set({ providerSessionId: session.id, checkoutUrl: session.url })
      .where(eq(macOrders.id, order.id));

    return { ok: true, url: session.url! };
  } catch (e) {
    console.error("startCheckout failed", e);
    return { ok: false, error: "server" };
  }
}
