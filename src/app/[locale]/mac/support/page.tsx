import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { site } from "@/lib/site";
import { localeAlternates } from "@/lib/i18n-meta";
import {
  MacPageHeader,
  MacFaq,
  MacSupport,
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
    locale === routing.defaultLocale ? "/mac/support" : `/${locale}/mac/support`;
  const title = `${t("pages.supportTitle")} — Xico Clean`;
  return {
    title: { absolute: title },
    description: t("pages.supportSubtitle"),
    alternates: {
      canonical: path,
      languages: localeAlternates("/mac/support"),
    },
    openGraph: {
      type: "website",
      siteName: "Xico Clean",
      title,
      description: t("pages.supportSubtitle"),
      url: `${site.url}${path}`,
    },
  };
}

export default async function MacSupportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "mac" });
  return (
    <>
      <MacPageHeader
        kicker={t("nav.support")}
        title={t("pages.supportTitle")}
        lede={t("pages.supportSubtitle")}
      />
      <MacFaq />
      <MacSupport />
      <MacWaitlist />
    </>
  );
}
