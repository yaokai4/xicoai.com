import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { site } from "@/lib/site";
import { localeAlternates, ogLocales } from "@/lib/i18n-meta";
import {
  breadcrumbJsonLd,
  faqJsonLd,
  jsonLdScript,
  absoluteUrl,
  productName,
} from "@/lib/seo";
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
  const title = t("meta.supportTitle");
  const description = t("meta.supportDescription");
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: path,
      languages: localeAlternates("/mac/support"),
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

export default async function MacSupportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "mac" });
  const tfaq = await getTranslations({ locale, namespace: "mac.faq" });
  const faqItems = tfaq.raw("items") as { q: string; a: string }[];
  const lp = locale === routing.defaultLocale ? "" : `/${locale}`;
  const nodes = [
    breadcrumbJsonLd([
      { name: productName(locale), url: absoluteUrl("/mac", lp) },
      { name: t("nav.support"), url: absoluteUrl("/mac/support", lp) },
    ]),
    faqJsonLd(faqItems),
  ];
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(nodes) }}
      />
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
