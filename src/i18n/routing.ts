import { defineRouting } from "next-intl/routing";

export const locales = ["zh", "ja", "en"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "zh",
  // Chinese (primary market) lives at "/", Japanese at "/ja", English at "/en".
  localePrefix: "as-needed",
  localeDetection: false,
});
