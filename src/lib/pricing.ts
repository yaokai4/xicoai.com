/**
 * Xico Clean pricing model — admin-editable and stored as one JSON blob in the
 * `settings` KV under `mac_pricing`.
 *
 * v2 (multi-currency): prices are a matrix of currency × plan. The buy page
 * picks the buyer's currency from IP country / locale (see lib/geo.ts) among
 * the currencies the admin has configured, falling back to `defaultCurrency`.
 * v1 blobs ({ currency, personal, family }) parse transparently into a
 * single-currency v2 shape, so no data migration is needed.
 *
 * Amounts are in MAJOR units (e.g. 128 means ¥128 / $128) for admin
 * friendliness; `toMinorUnits` converts to what Stripe expects. A discount is
 * expressed as a `compareAt` (struck-through) price higher than `amount`.
 *
 * This file is pure (no server imports) so client components can format
 * prices. Reading/writing the DB lives in `pricing.server.ts`.
 */

export type PlanId = "personal" | "family";

export type PlanPricing = {
  /** Charge price in major units. */
  amount: number;
  /** Optional struck-through "original" price for a discount badge. */
  compareAt: number | null;
};

export type CurrencyPricing = {
  personal: PlanPricing;
  family: PlanPricing;
};

export type MacPricing = {
  /** When false the buy page shows "coming soon" and keeps the waitlist CTA. */
  active: boolean;
  /** Currency used when the visitor's country/locale has no configured match. */
  defaultCurrency: string;
  /** ISO 4217 code → per-plan prices. Only listed currencies are sellable. */
  currencies: Record<string, CurrencyPricing>;
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
  "zh-Hant": "zh-TW",
  ja: "ja-JP",
  en: "en-US",
  ko: "ko-KR",
  de: "de-DE",
  es: "es-419",
  fr: "fr-FR",
  it: "it-IT",
  pt: "pt-BR",
  ru: "ru-RU",
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

/** Suggested starter rows for the admin console's "add currency" helper —
 * roughly purchasing-power-adjusted from the CNY anchor. Admin-editable. */
export const SUGGESTED_CURRENCY_PRESETS: Record<string, CurrencyPricing> = {
  CNY: { personal: { amount: 38, compareAt: 129 }, family: { amount: 68, compareAt: 218 } },
  USD: { personal: { amount: 5.99, compareAt: 19.99 }, family: { amount: 9.99, compareAt: 34.99 } },
  JPY: { personal: { amount: 880, compareAt: 2980 }, family: { amount: 1480, compareAt: 4980 } },
  EUR: { personal: { amount: 5.99, compareAt: 18.99 }, family: { amount: 9.99, compareAt: 32.99 } },
  KRW: { personal: { amount: 7900, compareAt: 26000 }, family: { amount: 13900, compareAt: 45000 } },
  TWD: { personal: { amount: 180, compareAt: 620 }, family: { amount: 320, compareAt: 1080 } },
  HKD: { personal: { amount: 45, compareAt: 158 }, family: { amount: 78, compareAt: 268 } },
  GBP: { personal: { amount: 4.99, compareAt: 16.99 }, family: { amount: 8.99, compareAt: 28.99 } },
  BRL: { personal: { amount: 29, compareAt: 99 }, family: { amount: 49, compareAt: 169 } },
};

export const DEFAULT_PRICING: MacPricing = {
  // Off by default: the owner sets prices in the admin console, then flips
  // this on. Until then the buy page falls back to the waitlist.
  active: false,
  defaultCurrency: "USD",
  currencies: {
    CNY: SUGGESTED_CURRENCY_PRESETS.CNY,
    USD: SUGGESTED_CURRENCY_PRESETS.USD,
  },
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

function coerceCurrency(raw: unknown): CurrencyPricing {
  const o = (raw ?? {}) as Record<string, unknown>;
  return {
    personal: coercePlan(o.personal, { amount: 0, compareAt: null }),
    family: coercePlan(o.family, { amount: 0, compareAt: null }),
  };
}

function normCode(code: unknown): string | null {
  const c = String(code ?? "").trim().toUpperCase();
  return /^[A-Z]{3}$/.test(c) ? c : null;
}

/** Parse the stored JSON blob — v2, or a legacy v1 single-currency blob. */
export function parsePricing(raw: string | null | undefined): MacPricing {
  if (!raw) return DEFAULT_PRICING;
  try {
    const o = JSON.parse(raw) as Record<string, unknown>;

    // v2: { active, defaultCurrency, currencies: { USD: {...} } }
    if (o.currencies && typeof o.currencies === "object") {
      const currencies: Record<string, CurrencyPricing> = {};
      for (const [code, val] of Object.entries(
        o.currencies as Record<string, unknown>,
      )) {
        const norm = normCode(code);
        if (norm) currencies[norm] = coerceCurrency(val);
      }
      if (!Object.keys(currencies).length) return DEFAULT_PRICING;
      const def = normCode(o.defaultCurrency);
      return {
        active: Boolean(o.active),
        defaultCurrency:
          def && currencies[def] ? def : Object.keys(currencies)[0],
        currencies,
      };
    }

    // v1: { currency, active, personal, family }
    const code = normCode(o.currency) ?? "CNY";
    return {
      active: Boolean(o.active),
      defaultCurrency: code,
      currencies: {
        [code]: {
          personal: coercePlan(o.personal, DEFAULT_PRICING.currencies.CNY.personal),
          family: coercePlan(o.family, DEFAULT_PRICING.currencies.CNY.family),
        },
      },
    };
  } catch {
    return DEFAULT_PRICING;
  }
}

export function serializePricing(p: MacPricing): string {
  return JSON.stringify(p);
}

/** Prices for one currency, tolerant of a code that's not configured. */
export function currencyPricing(
  pricing: MacPricing,
  currency: string,
): CurrencyPricing {
  return (
    pricing.currencies[currency.toUpperCase()] ??
    pricing.currencies[pricing.defaultCurrency] ??
    Object.values(pricing.currencies)[0]
  );
}

/** The currency actually used when asking for `currency` (handles fallback). */
export function effectiveCurrency(
  pricing: MacPricing,
  currency: string | null | undefined,
): string {
  const c = normCode(currency);
  if (c && pricing.currencies[c]) return c;
  return pricing.currencies[pricing.defaultCurrency]
    ? pricing.defaultCurrency
    : Object.keys(pricing.currencies)[0];
}
