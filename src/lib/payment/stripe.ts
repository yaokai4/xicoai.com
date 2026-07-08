import "server-only";

import Stripe from "stripe";
import type { MacOrder } from "@/db/schema";

/**
 * Stripe integration for Xico Clean. We reuse the SAME Stripe account as
 * Shangence: because Checkout uses dynamic `price_data` (not pre-created Price
 * objects), selling a new product needs nothing configured in the dashboard.
 * A dedicated webhook endpoint (its own signing secret) points at this app and
 * fulfils only orders whose metadata.brand === "xico-clean".
 */

export const BRAND = "xico-clean";

let client: Stripe | null = null;

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set.");
  client ||= new Stripe(key);
  return client;
}

export type CheckoutParams = {
  order: MacOrder;
  productName: string;
  productDescription?: string;
  successUrl: string;
  cancelUrl: string;
  email?: string | null;
  locale?: string;
};

/** Site locale → Stripe Checkout display locale. */
const STRIPE_LOCALES: Record<
  string,
  Stripe.Checkout.SessionCreateParams.Locale
> = {
  zh: "zh",
  "zh-Hant": "zh-TW",
  ja: "ja",
  en: "en",
  ko: "ko",
  de: "de",
  es: "es-419",
  fr: "fr",
  it: "it",
  pt: "pt-BR",
  ru: "ru",
};

function stripeLocale(
  locale?: string,
): Stripe.Checkout.SessionCreateParams.Locale {
  return STRIPE_LOCALES[locale ?? ""] ?? "auto";
}

export async function createCheckoutSession(
  params: CheckoutParams,
): Promise<Stripe.Checkout.Session> {
  const { order, productName, productDescription, successUrl, cancelUrl } =
    params;
  const metadata = { orderNo: order.orderNo, plan: order.plan, brand: BRAND };

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    client_reference_id: order.orderNo,
    locale: stripeLocale(params.locale),
    customer_email: params.email || undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: order.currency.toLowerCase(),
          unit_amount: order.amount,
          product_data: {
            name: productName,
            description: productDescription,
            metadata,
          },
        },
      },
    ],
    metadata,
    payment_intent_data: {
      metadata,
      // Distinguish Xico charges on the shared account's card statements.
      statement_descriptor_suffix: "XICOCLEAN",
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL.");
  return session;
}

export function constructWebhookEvent(
  rawBody: string,
  signature: string,
): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not set.");
  return getStripe().webhooks.constructEvent(rawBody, signature, secret);
}
