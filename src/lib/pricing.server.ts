import "server-only";

import { getSettings } from "@/lib/settings";
import {
  parsePricing,
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

export function planPricing(pricing: MacPricing, plan: PlanId): PlanPricing {
  return plan === "family" ? pricing.family : pricing.personal;
}
