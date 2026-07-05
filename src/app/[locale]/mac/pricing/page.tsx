import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { site } from "@/lib/site";
import { MacPricing, MacCompare, MacDownload } from "@/components/mac/mac-sections";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "mac" });
  const path =
    locale === routing.defaultLocale ? "/mac/pricing" : `/${locale}/mac/pricing`;
  const title = `${t("pricing.title")} — Xico Clean`;
  return {
    title: { absolute: title },
    description: t("pricing.subtitle"),
    alternates: {
      canonical: path,
      languages: {
        zh: "/mac/pricing",
        ja: "/ja/mac/pricing",
        en: "/en/mac/pricing",
      },
    },
    openGraph: {
      type: "website",
      siteName: "Xico Clean",
      title,
      description: t("pricing.subtitle"),
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
  return (
    <>
      <MacPricing topPad />
      <MacCompare />
      <MacDownload />
    </>
  );
}
