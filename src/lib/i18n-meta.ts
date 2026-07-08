import { routing } from "@/i18n/routing";

/**
 * hreflang alternates for a path, e.g. localeAlternates("/mac/buy") →
 * { zh: "/mac/buy", "zh-Hant": "/zh-Hant/mac/buy", ja: "/ja/mac/buy", … }.
 * Scales automatically with routing.locales.
 */
export function localeAlternates(path: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const locale of routing.locales) {
    map[locale] =
      locale === routing.defaultLocale ? path || "/" : `/${locale}${path}`;
  }
  return map;
}
