import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { site } from "@/lib/site";
import { getMacPricing, planPricing } from "@/lib/pricing.server";
import { formatMoney, discountPercent, PLAN_IDS } from "@/lib/pricing";
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
      languages: {
        zh: "/mac/buy",
        ja: "/ja/mac/buy",
        en: "/en/mac/buy",
      },
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

  const plans: PlanView[] = PLAN_IDS.map((id) => {
    const tier = planPricing(pricing, id);
    return {
      id,
      amountLabel: formatMoney(tier.amount, pricing.currency, locale),
      compareLabel: tier.compareAt
        ? formatMoney(tier.compareAt, pricing.currency, locale)
        : null,
      discount: discountPercent(tier),
    };
  });

  return <MacBuy canBuy={canBuy} plans={plans} canceled={Boolean(canceled)} />;
}
