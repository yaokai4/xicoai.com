import { getMacPricing } from "@/lib/pricing.server";
import { PricingForm } from "./pricing-form";

export const dynamic = "force-dynamic";

export default async function PricingAdminPage() {
  const pricing = await getMacPricing();
  return <PricingForm initial={pricing} />;
}
