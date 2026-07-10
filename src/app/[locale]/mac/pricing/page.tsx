import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { site } from "@/lib/site";
import { localeAlternates } from "@/lib/i18n-meta";
import { breadcrumbJsonLd, jsonLdScript, absoluteUrl } from "@/lib/seo";
import { getMarketingPlans } from "@/lib/plan-views";
import {
  MacPricingSection,
  MacAllInOne,
  MacCompare,
  MacDownload,
} from "@/components/mac/mac-sections";

// Prices come from the admin console (DB) and the visitor's region — always
// render fresh.
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
      siteName: "Xico Clean",
      title,
      description,
      url: `${site.url}${path}`,
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
  const { active, plans } = await getMarketingPlans(locale);
  const lp = locale === routing.defaultLocale ? "" : `/${locale}`;
  const breadcrumb = breadcrumbJsonLd([
    { name: "Xico Clean", url: absoluteUrl("/mac", lp) },
    { name: t("nav.pricing"), url: absoluteUrl("/mac/pricing", lp) },
  ]);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumb) }}
      />
      <MacPricingSection plans={plans} active={active} topPad />
      <MacAllInOne />
      <MacCompare />
      <MacDownload />
    </>
  );
}
