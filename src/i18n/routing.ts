import { defineRouting } from "next-intl/routing";

/** Mirrors the Mac app's 11 languages. zh (Simplified) is the primary market
 * and lives at "/"; every other locale gets a URL prefix. */
export const locales = [
  "zh",
  "zh-Hant",
  "ja",
  "en",
  "ko",
  "de",
  "es",
  "fr",
  "it",
  "pt",
  "ru",
] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "zh",
  localePrefix: "as-needed",
  // Detection is OURS (proxy.ts): system language (Accept-Language) first,
  // then IP country — next-intl's built-in detection stays off.
  localeDetection: false,
});
