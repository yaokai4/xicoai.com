/**
 * Language & currency detection.
 *
 * Language = the visitor's SYSTEM language first (Accept-Language), then IP
 * country as a fallback signal. Currency = IP country first (that's where
 * their card/bank lives), then locale. Both only pick from what's actually
 * available (routing.locales / admin-configured currencies).
 *
 * IP → country uses `ip3country` (a ~1.5 MB embedded table, no network I/O),
 * safe to call from proxy.ts — Next 16 proxy runs on the Node runtime.
 */

import ip3country from "ip3country";

let ipReady = false;
function ensureIpDb() {
  if (!ipReady) {
    ip3country.init();
    ipReady = true;
  }
}

/** First public-looking address from x-forwarded-for / x-real-ip. */
export function clientIp(headers: Headers): string | null {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip");
}

export function countryFromIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  try {
    ensureIpDb();
    // Strip an IPv4-mapped IPv6 prefix (::ffff:1.2.3.4 — common behind Caddy).
    const v4 = ip.startsWith("::ffff:") ? ip.slice(7) : ip;
    return ip3country.lookupStr(v4) ?? null;
  } catch {
    return null;
  }
}

/* ── country → site locale ─────────────────────────────────── */

const COUNTRY_LOCALE: Record<string, string> = {
  CN: "zh",
  SG: "zh",
  TW: "zh-Hant",
  HK: "zh-Hant",
  MO: "zh-Hant",
  JP: "ja",
  KR: "ko",
  DE: "de", AT: "de", LI: "de",
  FR: "fr", MC: "fr",
  IT: "it", SM: "it",
  ES: "es", MX: "es", AR: "es", CO: "es", CL: "es", PE: "es", VE: "es",
  UY: "es", EC: "es", GT: "es", BO: "es", PY: "es", SV: "es", HN: "es",
  NI: "es", CR: "es", PA: "es", DO: "es",
  BR: "pt", PT: "pt",
  RU: "ru", BY: "ru", KZ: "ru", KG: "ru",
};

export function localeForCountry(country: string | null): string | null {
  if (!country) return null;
  return COUNTRY_LOCALE[country.toUpperCase()] ?? null;
}

/* ── Accept-Language → site locale ─────────────────────────── */

/**
 * Match the browser/system languages against our locale list.
 * Handles Chinese script variants explicitly (zh-TW/zh-HK/zh-Hant → zh-Hant).
 */
export function localeFromAcceptLanguage(
  header: string | null,
  locales: readonly string[],
): string | null {
  if (!header) return null;
  const candidates = header
    .split(",")
    .map((part) => {
      const [tag, qs] = part.trim().split(";");
      const q = qs?.startsWith("q=") ? parseFloat(qs.slice(2)) : 1;
      return { tag: tag.trim(), q: Number.isFinite(q) ? q : 0 };
    })
    .filter((c) => c.tag)
    .sort((a, b) => b.q - a.q);

  const lower = new Map(locales.map((l) => [l.toLowerCase(), l]));

  for (const { tag } of candidates) {
    const t = tag.toLowerCase();
    // Exact (e.g. "zh-hant") then Chinese script/region special cases.
    const exact = lower.get(t);
    if (exact) return exact;
    if (t === "zh-tw" || t === "zh-hk" || t === "zh-mo" || t.startsWith("zh-hant")) {
      if (lower.has("zh-hant")) return lower.get("zh-hant")!;
    }
    if (t.startsWith("zh")) {
      if (lower.has("zh")) return lower.get("zh")!;
    }
    // Primary-subtag match: "pt-br" → "pt", "de-ch" → "de".
    const primary = t.split("-")[0];
    const byPrimary = lower.get(primary);
    if (byPrimary) return byPrimary;
  }
  return null;
}

/* ── currency detection ────────────────────────────────────── */

const EURO_COUNTRIES = new Set([
  "AT", "BE", "CY", "DE", "EE", "ES", "FI", "FR", "GR", "HR", "IE",
  "IT", "LT", "LU", "LV", "MT", "NL", "PT", "SI", "SK",
]);

const COUNTRY_CURRENCY: Record<string, string> = {
  CN: "CNY",
  JP: "JPY",
  KR: "KRW",
  TW: "TWD",
  HK: "HKD",
  MO: "HKD",
  GB: "GBP",
  US: "USD",
  CA: "CAD",
  AU: "AUD",
  NZ: "NZD",
  SG: "SGD",
  BR: "BRL",
  MX: "MXN",
  IN: "INR",
  CH: "CHF",
};

function currencyForCountry(country: string | null): string | null {
  if (!country) return null;
  const c = country.toUpperCase();
  if (EURO_COUNTRIES.has(c)) return "EUR";
  return COUNTRY_CURRENCY[c] ?? null;
}

/** Locale-implied currency, for when IP country tells us nothing. */
const LOCALE_CURRENCY: Record<string, string> = {
  zh: "CNY",
  "zh-Hant": "TWD",
  ja: "JPY",
  ko: "KRW",
  de: "EUR",
  fr: "EUR",
  it: "EUR",
  es: "USD",
  pt: "BRL",
  ru: "USD",
  en: "USD",
};

/**
 * Pick the currency to quote: IP country → locale → default, constrained to
 * the currencies the admin actually configured (`available`).
 */
export function detectCurrency(opts: {
  country: string | null;
  locale: string;
  available: readonly string[];
  fallback: string;
}): string {
  const has = (c: string | null): c is string =>
    Boolean(c && opts.available.includes(c));
  const byCountry = currencyForCountry(opts.country);
  if (has(byCountry)) return byCountry;
  const byLocale = LOCALE_CURRENCY[opts.locale] ?? null;
  if (has(byLocale)) return byLocale;
  return opts.fallback;
}
