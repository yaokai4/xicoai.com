import { headers } from "next/headers";
import { getMacPricing, planPricing } from "@/lib/pricing.server";
import {
  formatMoney,
  discountPercent,
  effectiveCurrency,
  PLAN_IDS,
  type MacPricing,
} from "@/lib/pricing";
import { clientIp, countryFromIp, detectCurrency } from "@/lib/geo";
import type { PlanView } from "@/components/mac/mac-buy";

/**
 * Read-only pricing snapshot for marketing sections (/mac home + /mac/pricing).
 * Quotes the visitor's own currency (IP country first, locale second) and
 * renders the same PlanView shape the buy page uses — but only for display;
 * the actual checkout flow lives untouched on /mac/buy.
 */
export async function getMarketingPlans(locale: string): Promise<{
  pricing: MacPricing;
  active: boolean;
  currency: string;
  plans: PlanView[];
}> {
  const pricing = await getMacPricing();
  const currencies = Object.keys(pricing.currencies);
  const country = countryFromIp(clientIp(await headers()));
  const currency = effectiveCurrency(
    pricing,
    detectCurrency({
      country,
      locale,
      available: currencies,
      fallback: pricing.defaultCurrency,
    }),
  );

  const plans: PlanView[] = PLAN_IDS.map((id) => {
    const tier = planPricing(pricing, currency, id);
    const genuineCompareAt =
      tier.compareAt && tier.compareAt > tier.amount ? tier.compareAt : null;
    return {
      id,
      amountLabel: tier.amount > 0 ? formatMoney(tier.amount, currency, locale) : "",
      compareLabel: genuineCompareAt
        ? formatMoney(genuineCompareAt, currency, locale)
        : null,
      discount: discountPercent(tier),
    };
  });

  return { pricing, active: pricing.active, currency, plans };
}
