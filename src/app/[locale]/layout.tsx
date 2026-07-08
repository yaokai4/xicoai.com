import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import {
  getTranslations,
  getMessages,
  setRequestLocale,
} from "next-intl/server";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/theme-provider";
import { Ambient } from "@/components/ambient";
import { ScrollProgress } from "@/components/scroll-progress";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FooterSwitch } from "@/components/footer-switch";
import { MacFooter } from "@/components/mac/mac-footer";
import { site } from "@/lib/site";
import { localeAlternates } from "@/lib/i18n-meta";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const HTML_LANG: Record<string, string> = {
  zh: "zh-CN",
  "zh-Hant": "zh-Hant",
  ja: "ja",
  en: "en",
  ko: "ko",
  de: "de",
  es: "es",
  fr: "fr",
  it: "it",
  pt: "pt-BR",
  ru: "ru",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Rendered per request so the footer reflects social links set in /admin
// (getSettings is itself cached, so this stays cheap).
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    metadataBase: new URL(site.url),
    title: {
      default: t("title"),
      template: t("titleTemplate"),
    },
    description: t("description"),
    applicationName: site.name,
    alternates: {
      canonical: locale === routing.defaultLocale ? "/" : `/${locale}`,
      languages: localeAlternates(""),
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      title: t("title"),
      description: t("description"),
      url: site.url,
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  // The Xico Clean product site is also served on the mac.* subdomain, where
  // its chrome is the product header/footer rather than the company one.
  const host = (await headers()).get("host") ?? "";
  const isMacSite = host.split(":")[0].toLowerCase().startsWith("mac.");

  return (
    <html
      lang={HTML_LANG[locale] ?? locale}
      className={`${inter.variable} ${sora.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            <Ambient />
            <ScrollProgress />
            <SiteHeader isMacSite={isMacSite} />
            <main>{children}</main>
            <FooterSwitch
              isMacSite={isMacSite}
              company={<SiteFooter />}
              product={<MacFooter />}
            />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
