"use server";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { macOrders } from "@/db/schema";
import { getMacPricing, planPricing } from "@/lib/pricing.server";
import {
  toMinorUnits,
  effectiveCurrency,
  type PlanId,
} from "@/lib/pricing";
import {
  createCheckoutSession,
  stripeConfigured,
} from "@/lib/payment/stripe";
import { locales, type Locale } from "@/i18n/routing";

export type CheckoutState = { ok: boolean; url?: string; error?: string };

const PLAN_LABEL: Record<PlanId, Record<Locale, string>> = {
  personal: {
    zh: "个人版", "zh-Hant": "個人版", ja: "個人版", en: "Personal",
    ko: "개인용", de: "Einzellizenz", es: "Personal", fr: "Personnelle",
    it: "Personale", pt: "Pessoal", ru: "Личная",
  },
  family: {
    zh: "家庭版", "zh-Hant": "家庭版", ja: "ファミリー版", en: "Family",
    ko: "패밀리", de: "Familienlizenz", es: "Familiar", fr: "Famille",
    it: "Famiglia", pt: "Família", ru: "Семейная",
  },
};
const PLAN_DESC: Record<PlanId, Record<Locale, string>> = {
  personal: {
    zh: "1 台 Mac · 永久买断，长期免费更新",
    "zh-Hant": "1 台 Mac · 永久買斷，長期免費更新",
    ja: "Mac 1台 · 買い切り、無料アップデート",
    en: "1 Mac · one-time purchase, free updates",
    ko: "Mac 1대 · 평생 소장, 무료 업데이트",
    de: "1 Mac · Einmalkauf, kostenlose Updates",
    es: "1 Mac · pago único, actualizaciones gratis",
    fr: "1 Mac · achat unique, mises à jour gratuites",
    it: "1 Mac · acquisto una tantum, aggiornamenti gratuiti",
    pt: "1 Mac · compra única, atualizações grátis",
    ru: "1 Mac · разовая покупка, бесплатные обновления",
  },
  family: {
    zh: "最多 5 台 Mac · 永久买断，长期免费更新",
    "zh-Hant": "最多 5 台 Mac · 永久買斷，長期免費更新",
    ja: "最大5台 · 買い切り、無料アップデート",
    en: "Up to 5 Macs · one-time purchase, free updates",
    ko: "최대 Mac 5대 · 평생 소장, 무료 업데이트",
    de: "Bis zu 5 Macs · Einmalkauf, kostenlose Updates",
    es: "Hasta 5 Macs · pago único, actualizaciones gratis",
    fr: "Jusqu'à 5 Mac · achat unique, mises à jour gratuites",
    it: "Fino a 5 Mac · acquisto una tantum, aggiornamenti gratuiti",
    pt: "Até 5 Macs · compra única, atualizações grátis",
    ru: "До 5 Mac · разовая покупка, бесплатные обновления",
  },
};

function normLocale(v: string | undefined): Locale {
  return (locales as readonly string[]).includes(v ?? "")
    ? (v as Locale)
    : "zh";
}

/**
 * Create a pending order + Stripe Checkout session for a plan and return the
 * hosted checkout URL. Called directly from the buy page client. `currencyRaw`
 * is the buyer-visible currency picked on the page (validated against the
 * admin-configured list — an unknown code falls back to the default).
 */
export async function startCheckout(
  planRaw: string,
  localeRaw: string,
  currencyRaw?: string,
): Promise<CheckoutState> {
  const plan: PlanId = planRaw === "family" ? "family" : "personal";
  const locale = normLocale(localeRaw);

  const pricing = await getMacPricing();
  if (!pricing.active || !stripeConfigured()) {
    return { ok: false, error: "unavailable" };
  }
  const currency = effectiveCurrency(pricing, currencyRaw);
  const tier = planPricing(pricing, currency, plan);
  const amount = toMinorUnits(tier.amount, currency);
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
        currency,
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
