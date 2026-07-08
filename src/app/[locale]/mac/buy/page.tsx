import type { Metadata } from "next";
import { headers } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { site } from "@/lib/site";
import { localeAlternates } from "@/lib/i18n-meta";
import { getMacPricing, planPricing } from "@/lib/pricing.server";
import { formatMoney, discountPercent, PLAN_IDS } from "@/lib/pricing";
import { clientIp, countryFromIp, detectCurrency } from "@/lib/geo";
import { stripeConfigured } from "@/lib/payment/stripe";
import { MacBuy, type PlanView } from "@/components/mac/mac-buy";

// Prices come from the admin console (DB) — always render fresh.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "mac.buy" });
  const path = locale === routing.defaultLocale ? "/mac/buy" : `/${locale}/mac/buy`;
  const title = `${t("title")} — Xico Clean`;
  return {
    title: { absolute: title },
    description: t("subtitle"),
    alternates: {
      canonical: path,
      languages: localeAlternates("/mac/buy"),
    },
    openGraph: {
      type: "website",
      siteName: "Xico Clean",
      title,
      description: t("subtitle"),
      url: `${site.url}${path}`,
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

  // Quote the buyer's currency: IP country first, locale second — always
  // limited to what the admin configured. The client can still switch.
  const currencies = Object.keys(pricing.currencies);
  const country = countryFromIp(clientIp(await headers()));
  const initialCurrency = detectCurrency({
    country,
    locale,
    available: currencies,
    fallback: pricing.defaultCurrency,
  });

  const plansByCurrency: Record<string, PlanView[]> = {};
  for (const currency of currencies) {
    plansByCurrency[currency] = PLAN_IDS.map((id) => {
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
  }

  return (
    <MacBuy
      canBuy={canBuy}
      currencies={currencies}
      initialCurrency={initialCurrency}
      plansByCurrency={plansByCurrency}
      canceled={Boolean(canceled)}
    />
  );
}
