import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { site } from "@/lib/site";
import { MacHero } from "@/components/mac/mac-hero";
import {
  MacStats,
  MacFeatures,
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
    alternates: {
      canonical: path,
      languages: { zh: "/mac", ja: "/ja/mac", en: "/en/mac" },
    },
    openGraph: {
      type: "website",
      siteName: "Xico Clean",
      title: t("title"),
      description: t("description"),
      url: `${site.url}${path}`,
    },
    twitter: { card: "summary_large_image", title: t("title"), description: t("description") },
  };
}

export default async function MacHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "mac.meta" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Xico Clean",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "macOS 13.0 or later",
    description: t("description"),
    softwareVersion: "0.2.3",
    downloadUrl: `${site.url}/api/download/xico-clean`,
    author: { "@type": "Organization", name: "XICO AI", url: site.url },
    publisher: { "@type": "Organization", name: "XICO AI", url: site.url },
    url: `${site.url}/mac`,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MacHero />
      <MacStats />
      <MacFeatures moreHref="/mac/features" />
      <MacPrivacyTeaser />
      <MacPricingTeaser />
      <MacFaq />
      <MacDownload />
    </>
  );
}
