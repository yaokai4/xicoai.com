import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { site } from "@/lib/site";
import { localeAlternates } from "@/lib/i18n-meta";
import { softwareAppJsonLd, faqJsonLd, jsonLdScript } from "@/lib/seo";
import { priceRange, PLAN_IDS } from "@/lib/pricing";
import { getMarketingPlans } from "@/lib/plan-views";
import { MacHero } from "@/components/mac/mac-hero";
import {
  MacTrustBar,
  MacFeatures,
  MacLens,
  MacMenubar,
  MacSafety,
  MacPricingSection,
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
      siteName: "Xico Clean",
      title: t("title"),
      description: t("description"),
      url: `${site.url}${path}`,
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}

const SCREENSHOTS = [
  "/shots-03/home-dark.png",
  "/shots-03/spacelens-dark.png",
  "/shots-03/spacelens-drilled-dark.png",
  "/shots-03/menubar-rich.png",
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
  // matches what they'll see on the buy page. The same snapshot feeds the
  // on-page pricing section.
  const { pricing, active, currency, plans } = await getMarketingPlans(locale);
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
      <MacTrustBar />
      <MacFeatures moreHref="/mac/features" />
      <MacLens />
      <MacMenubar />
      <MacSafety />
      <MacPricingSection plans={plans} active={active} />
      <MacFaq />
      <MacDownload />
    </>
  );
}
