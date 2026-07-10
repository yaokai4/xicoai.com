import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { site } from "@/lib/site";
import { localeAlternates, ogLocales } from "@/lib/i18n-meta";
import { breadcrumbJsonLd, jsonLdScript, absoluteUrl, productName } from "@/lib/seo";
import { MacPrivacy, MacSafety, MacWaitlist } from "@/components/mac/mac-sections";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "mac" });
  const path =
    locale === routing.defaultLocale ? "/mac/security" : `/${locale}/mac/security`;
  const title = t("meta.securityTitle");
  const description = t("meta.securityDescription");
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: path,
      languages: localeAlternates("/mac/security"),
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

export default async function MacSecurityPage({
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
    { name: t("nav.security"), url: absoluteUrl("/mac/security", lp) },
  ]);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumb) }}
      />
      <MacSafety topPad />
      <MacPrivacy />
      <MacWaitlist />
    </>
  );
}
