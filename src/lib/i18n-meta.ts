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

/** OpenGraph `og:locale` code (language_TERRITORY) per site locale. */
const OG_LOCALE: Record<string, string> = {
  zh: "zh_CN",
  "zh-Hant": "zh_TW",
  ja: "ja_JP",
  en: "en_US",
  ko: "ko_KR",
  de: "de_DE",
  es: "es_ES",
  fr: "fr_FR",
  it: "it_IT",
  pt: "pt_BR",
  ru: "ru_RU",
};

/**
 * `og:locale` + `og:locale:alternate` for the current locale. Spread into any
 * page's `openGraph` so social/AI previews render in the right language and
 * advertise the other 10 language variants. (Next replaces the parent
 * `openGraph` when a page sets its own, so every page must include this.)
 */
export function ogLocales(locale: string): {
  locale: string;
  alternateLocale: string[];
} {
  return {
    locale: OG_LOCALE[locale] ?? "en_US",
    alternateLocale: routing.locales
      .filter((l) => l !== locale)
      .map((l) => OG_LOCALE[l] ?? l),
  };
}
