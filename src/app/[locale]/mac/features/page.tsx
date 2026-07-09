import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { site } from "@/lib/site";
import { localeAlternates } from "@/lib/i18n-meta";
import { breadcrumbJsonLd, jsonLdScript, absoluteUrl } from "@/lib/seo";
import {
  MacPageHeader,
  MacCatalog,
  MacDeepDive,
  MacMonitor,
  MacHardware,
  MacPerformance,
  MacWaitlist,
} from "@/components/mac/mac-sections";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "mac" });
  const path =
    locale === routing.defaultLocale ? "/mac/features" : `/${locale}/mac/features`;
  const title = t("meta.featuresTitle");
  const description = t("meta.featuresDescription");
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: path,
      languages: localeAlternates("/mac/features"),
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

export default async function MacFeaturesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "mac" });
  const lp = locale === routing.defaultLocale ? "" : `/${locale}`;
  const breadcrumb = breadcrumbJsonLd([
    { name: "Xico Clean", url: absoluteUrl("/mac", lp) },
    { name: t("nav.features"), url: absoluteUrl("/mac/features", lp) },
  ]);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumb) }}
      />
      <MacPageHeader
        kicker={t("nav.features")}
        title={t("pages.featuresTitle")}
        lede={t("pages.featuresSubtitle")}
      />
      <MacDeepDive />
      <MacMonitor />
      <MacHardware />
      <MacCatalog />
      <MacPerformance />
      <MacWaitlist />
    </>
  );
}
