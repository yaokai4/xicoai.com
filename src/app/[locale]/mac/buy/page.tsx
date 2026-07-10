import type { Metadata } from "next";
import { headers } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { site } from "@/lib/site";
import { localeAlternates, ogLocales } from "@/lib/i18n-meta";
import { getMacPricing, planPricing } from "@/lib/pricing.server";
import { formatMoney, discountPercent, priceRange, PLAN_IDS } from "@/lib/pricing";
import { clientIp, countryFromIp, detectCurrency } from "@/lib/geo";
import { stripeConfigured } from "@/lib/payment/stripe";
import {
  breadcrumbJsonLd,
  softwareAppJsonLd,
  jsonLdScript,
  absoluteUrl,
  productName,
} from "@/lib/seo";
import { MacBuy, type PlanView } from "@/components/mac/mac-buy";

// Prices come from the admin console (DB) — always render fresh.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "mac" });
  const path = locale === routing.defaultLocale ? "/mac/buy" : `/${locale}/mac/buy`;
  const title = t("meta.buyTitle");
  const description = t("meta.buyDescription");
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: path,
      languages: localeAlternates("/mac/buy"),
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

export default async function MacBuyPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ canceled?: string }>;
}) {
  const { locale } = await params;
  const { canceled } = await searchParams;
  setRequestLocale(locale);

  const pricing = await getMacPricing();
  const canBuy = pricing.active && stripeConfigured();

  // 按访客地区锁定一种货币（IP 国家优先，locale 兜底），只报这一种价——
  // 日本区只有日元、中国区只有人民币，不给用户切换选择。
  const currencies = Object.keys(pricing.currencies);
  const country = countryFromIp(clientIp(await headers()));
  const currency = detectCurrency({
    country,
    locale,
    available: currencies,
    fallback: pricing.defaultCurrency,
  });

  const plans: PlanView[] = PLAN_IDS.map((id) => {
    const tier = planPricing(pricing, currency, id);
    // A compareAt at or below the real price is a data mistake — never
    // render a "discount" that would make the price look raised.
    const genuineCompareAt =
      tier.compareAt && tier.compareAt > tier.amount ? tier.compareAt : null;
    return {
      id,
      amountLabel: formatMoney(tier.amount, currency, locale),
      compareLabel: genuineCompareAt
        ? formatMoney(genuineCompareAt, currency, locale)
        : null,
      discount: discountPercent(tier),
    };
  });

  // Structured data: the app + exact Offer in the buyer's currency, plus a
  // breadcrumb trail (Home › Buy). Gives the checkout URL real price semantics.
  const t = await getTranslations({ locale, namespace: "mac" });
  const lp = locale === routing.defaultLocale ? "" : `/${locale}`;
  const range = priceRange(pricing, currency);
  const app = softwareAppJsonLd({
    locale,
    description: t("meta.buyDescription"),
    featureList: (t.raw("features.items") as { name: string }[]).map((i) => i.name),
    offer: range
      ? {
          priceCurrency: currency,
          lowPrice: range.low,
          highPrice: range.high,
          offerCount: PLAN_IDS.length,
          available: canBuy,
        }
      : null,
  });
  const breadcrumb = breadcrumbJsonLd([
    { name: productName(locale), url: absoluteUrl("/mac", lp) },
    { name: t("nav.buy"), url: absoluteUrl("/mac/buy", lp) },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript([app, breadcrumb]) }}
      />
      <MacBuy
        canBuy={canBuy}
        currency={currency}
        plans={plans}
        canceled={Boolean(canceled)}
      />
    </>
  );
}
