import { routing } from "@/i18n/routing";

/**
 * Google-facing hreflang code for each site locale. `zh` is Simplified Chinese
 * (Mainland/Singapore) and `zh-Hant` is Traditional (Taiwan/Hong Kong); the
 * rest map 1:1. Using region-qualified tags where it matters helps Google route
 * the right variant to the right market.
 */
const HREFLANG: Record<string, string> = {
  zh: "zh-Hans",
  "zh-Hant": "zh-Hant",
  ja: "ja",
  en: "en",
  ko: "ko",
  de: "de",
  es: "es",
  fr: "fr",
  it: "it",
  pt: "pt",
  ru: "ru",
};

/**
 * hreflang alternates for a path, e.g. localeAlternates("/mac/buy") →
 * { "zh-Hans": "/mac/buy", "zh-Hant": "/zh-Hant/mac/buy", ja: "/ja/mac/buy", …,
 *   "x-default": "/mac/buy" }.
 *
 * `x-default` points at the default-locale URL so Google has an explicit
 * fallback for unmatched languages/regions — required for correct
 * international indexing. Scales automatically with routing.locales.
 */
export function localeAlternates(path: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const locale of routing.locales) {
    const href =
      locale === routing.defaultLocale ? path || "/" : `/${locale}${path}`;
    map[HREFLANG[locale] ?? locale] = href;
  }
  map["x-default"] = path || "/";
  return map;
}
