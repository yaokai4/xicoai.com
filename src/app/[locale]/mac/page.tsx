import type { Metadata } from "next";
import { headers } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { site } from "@/lib/site";
import { localeAlternates, ogLocales } from "@/lib/i18n-meta";
import {
  softwareAppJsonLd,
  faqJsonLd,
  jsonLdScript,
  productName,
} from "@/lib/seo";
import { getMacPricing } from "@/lib/pricing.server";
import { priceRange, effectiveCurrency, PLAN_IDS } from "@/lib/pricing";
import { clientIp, countryFromIp, detectCurrency } from "@/lib/geo";
import { MacHero } from "@/components/mac/mac-hero";
import {
  MacStats,
  MacFeatures,
  MacLens,
  MacSpeed,
  MacAllInOne,
  MacShowcase,
  MacPrivacyTeaser,
  MacPricingTeaser,
  MacFaq,
  MacDownload,
} from "@/components/mac/mac-sections";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "mac.meta" });
  const path = locale === routing.defaultLocale ? "/mac" : `/${locale}/mac`;
  return {
    title: { absolute: t("title") },
    description: t("description"),
    keywords: t.has("keywords") ? (t.raw("keywords") as string[]) : undefined,
    alternates: {
      canonical: path,
      languages: localeAlternates("/mac"),
    },
    openGraph: {
      type: "website",
      siteName: productName(locale),
      title: t("title"),
      description: t("description"),
      url: `${site.url}${path}`,
      ...ogLocales(locale),
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}

// SEO 结构化数据用英文白天模式新截图（canonical）。
const SCREENSHOTS = [
  "/mac/shots/en/dashboard.jpg",
  "/mac/shots/en/smartscan.jpg",
  "/mac/shots/en/spacelens.jpg",
  "/mac/shots/en/diskbench.jpg",
];

export default async function MacHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "mac.meta" });
  const tf = await getTranslations({ locale, namespace: "mac.features" });
  const tfaq = await getTranslations({ locale, namespace: "mac.faq" });

  // Real feature list from the product — a strong topical signal.
  const featureList = (tf.raw("items") as { name: string }[]).map(
    (f) => f.name,
  );
  const faqItems = tfaq.raw("items") as { q: string; a: string }[];

  // Quote the offer in the visitor's own currency so the SERP price card
  // matches what they'll see on the buy page.
  const pricing = await getMacPricing();
  const currencies = Object.keys(pricing.currencies);
  const country = countryFromIp(clientIp(await headers()));
  const currency = effectiveCurrency(
    pricing,
    detectCurrency({
      country,
      locale,
      available: currencies,
      fallback: pricing.defaultCurrency,
    }),
  );
  const range = priceRange(pricing, currency);
  const offer = range
    ? {
        priceCurrency: currency,
        lowPrice: range.low,
        highPrice: range.high,
        offerCount: PLAN_IDS.length,
        available: pricing.active,
      }
    : null;

  const nodes = [
    softwareAppJsonLd({
      locale,
      description: t("description"),
      featureList,
      offer,
      screenshots: SCREENSHOTS,
    }),
    faqJsonLd(faqItems),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(nodes) }}
      />
      <MacHero />
      <MacStats />
      <MacFeatures moreHref="/mac/features" />
      <MacLens />
      <MacSpeed />
      <MacAllInOne />
      <MacShowcase />
      <MacPrivacyTeaser />
      <MacPricingTeaser />
      <MacFaq />
      <MacDownload />
    </>
  );
}
