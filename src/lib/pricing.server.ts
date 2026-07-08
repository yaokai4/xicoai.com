import "server-only";

import { getSettings } from "@/lib/settings";
import {
  parsePricing,
  currencyPricing,
  type MacPricing,
  type PlanId,
  type PlanPricing,
} from "@/lib/pricing";

export const PRICING_SETTINGS_KEY = "mac_pricing";

/** Current pricing (admin-editable), falling back to defaults. */
export async function getMacPricing(): Promise<MacPricing> {
  const all = await getSettings();
  return parsePricing(all[PRICING_SETTINGS_KEY]);
}

/** Price of one plan in one currency (falls back to the default currency). */
export function planPricing(
  pricing: MacPricing,
  currency: string,
  plan: PlanId,
): PlanPricing {
  const c = currencyPricing(pricing, currency);
  return plan === "family" ? c.family : c.personal;
}
