/**
 * Xico Clean pricing model — admin-editable (price / currency / discount) and
 * stored as one JSON blob in the `settings` KV under `mac_pricing`.
 *
 * Amounts are in MAJOR units (e.g. 128 means ¥128 / $128) for admin friendliness;
 * `toMinorUnits` converts to what Stripe expects. A discount is expressed as a
 * `compareAt` (struck-through) price higher than `amount`.
 *
 * This file is pure (no server imports) so client components can format prices.
 * Reading/writing the DB lives in `pricing.server.ts`.
 */

export type PlanId = "personal" | "family";

export type PlanPricing = {
  /** Charge price in major units. */
  amount: number;
  /** Optional struck-through "original" price for a discount badge. */
  compareAt: number | null;
};

export type MacPricing = {
  currency: string;
  /** When false the buy page shows "coming soon" and keeps the waitlist CTA. */
  active: boolean;
  personal: PlanPricing;
  family: PlanPricing;
};

export const PLAN_IDS: PlanId[] = ["personal", "family"];

/** Seats (max activated Macs) granted per plan. */
export const PLAN_SEATS: Record<PlanId, number> = {
  personal: 1,
  family: 5,
};

export function seatsForPlan(plan: PlanId): number {
  return PLAN_SEATS[plan];
}

/** ISO 4217 codes Stripe treats as zero-decimal (minor unit == major unit). */
const ZERO_DECIMAL = new Set([
  "BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA", "PYG",
  "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF",
]);

export function isZeroDecimal(currency: string): boolean {
  return ZERO_DECIMAL.has((currency || "").toUpperCase());
}

/** Major-unit amount → Stripe's integer minor units. */
export function toMinorUnits(amount: number, currency: string): number {
  return isZeroDecimal(currency)
    ? Math.round(amount)
    : Math.round(amount * 100);
}

export function discountPercent(p: PlanPricing): number | null {
  if (!p.compareAt || p.compareAt <= p.amount) return null;
  return Math.round((1 - p.amount / p.compareAt) * 100);
}

const LOCALE_TAG: Record<string, string> = {
  zh: "zh-CN",
  ja: "ja-JP",
  en: "en-US",
};

/** Human-facing price string, e.g. "¥128" / "JP¥2,980" / "$28". */
export function formatMoney(
  amount: number,
  currency: string,
  locale = "zh",
): string {
  const tag = LOCALE_TAG[locale] ?? "en-US";
  try {
    return new Intl.NumberFormat(tag, {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: isZeroDecimal(currency) ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency.toUpperCase()} ${amount}`;
  }
}

export const DEFAULT_PRICING: MacPricing = {
  currency: "CNY",
  // Off by default: the owner sets prices in the admin console, then flips this
  // on. Until then the buy page falls back to the waitlist.
  active: false,
  personal: { amount: 128, compareAt: null },
  family: { amount: 218, compareAt: null },
};

function coercePlan(raw: unknown, fallback: PlanPricing): PlanPricing {
  const o = (raw ?? {}) as Record<string, unknown>;
  const amount = Number(o.amount);
  const compareAt = o.compareAt == null ? null : Number(o.compareAt);
  return {
    amount: Number.isFinite(amount) && amount >= 0 ? amount : fallback.amount,
    compareAt:
      compareAt != null && Number.isFinite(compareAt) && compareAt > 0
        ? compareAt
        : null,
  };
}

/** Parse the stored JSON blob, tolerating missing/partial fields. */
export function parsePricing(raw: string | null | undefined): MacPricing {
  if (!raw) return DEFAULT_PRICING;
  try {
    const o = JSON.parse(raw) as Partial<MacPricing>;
    return {
      currency:
        typeof o.currency === "string" && o.currency
          ? o.currency.toUpperCase()
          : DEFAULT_PRICING.currency,
      active: Boolean(o.active),
      personal: coercePlan(o.personal, DEFAULT_PRICING.personal),
      family: coercePlan(o.family, DEFAULT_PRICING.family),
    };
  } catch {
    return DEFAULT_PRICING;
  }
}

export function serializePricing(p: MacPricing): string {
  return JSON.stringify(p);
}
