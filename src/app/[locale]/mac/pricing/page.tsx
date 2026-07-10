import type { Metadata } from "next";
import { headers } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { site } from "@/lib/site";
import { localeAlternates, ogLocales } from "@/lib/i18n-meta";
import {
  breadcrumbJsonLd,
  softwareAppJsonLd,
  jsonLdScript,
  absoluteUrl,
  productName,
} from "@/lib/seo";
import { getMacPricing } from "@/lib/pricing.server";
import { priceRange, effectiveCurrency, PLAN_IDS } from "@/lib/pricing";
import { clientIp, countryFromIp, detectCurrency } from "@/lib/geo";
import { MacPricing, MacCompare, MacDownload } from "@/components/mac/mac-sections";

// Prices come from the admin console (DB) + per-visitor currency — render fresh.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "mac" });
  const path =
    locale === routing.defaultLocale ? "/mac/pricing" : `/${locale}/mac/pricing`;
  const title = t("meta.pricingTitle");
  const description = t("meta.pricingDescription");
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: path,
      languages: localeAlternates("/mac/pricing"),
    },
    openGraph: {
      type: "website",
      siteName: productName(locale),
      title,
      description,
      url: `${site.url}${path}`,
      ...ogLocales(locale),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function MacPricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "mac" });
  const lp = locale === routing.defaultLocale ? "" : `/${locale}`;
  const breadcrumb = breadcrumbJsonLd([
    { name: productName(locale), url: absoluteUrl("/mac", lp) },
    { name: t("nav.pricing"), url: absoluteUrl("/mac/pricing", lp) },
  ]);

  // SoftwareApplication + Offer with the visitor's exact plan prices — makes the
  // pricing URL itself eligible for the app/price rich result (once ratings exist)
  // and gives AI answer engines the concrete price for "how much is Xico".
  const pricing = await getMacPricing();
  const currency = effectiveCurrency(
    pricing,
    detectCurrency({
      country: countryFromIp(clientIp(await headers())),
      locale,
      available: Object.keys(pricing.currencies),
      fallback: pricing.defaultCurrency,
    }),
  );
  const range = priceRange(pricing, currency);
  const app = softwareAppJsonLd({
    locale,
    description: t("meta.pricingDescription"),
    featureList: (t.raw("features.items") as { name: string }[]).map((i) => i.name),
    offer: range
      ? {
          priceCurrency: currency,
          lowPrice: range.low,
          highPrice: range.high,
          offerCount: PLAN_IDS.length,
          available: pricing.active,
        }
      : null,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript([app, breadcrumb]) }}
      />
      <MacPricing topPad />
      <MacCompare />
      <MacDownload />
    </>
  );
}
