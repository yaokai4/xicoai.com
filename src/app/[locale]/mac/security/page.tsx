import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { site } from "@/lib/site";
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
  const title = `${t("nav.security")} · ${t("safety.eyebrow")} — Xico Clean`;
  return {
    title: { absolute: title },
    description: t("privacy.subtitle"),
    alternates: {
      canonical: path,
      languages: {
        zh: "/mac/security",
        ja: "/ja/mac/security",
        en: "/en/mac/security",
      },
    },
    openGraph: {
      type: "website",
      siteName: "Xico Clean",
      title,
      description: t("privacy.subtitle"),
      url: `${site.url}${path}`,
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
  return (
    <>
      <MacSafety topPad />
      <MacPrivacy />
      <MacWaitlist />
    </>
  );
}
