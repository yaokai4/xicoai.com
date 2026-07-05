import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { BuySuccess } from "@/components/mac/buy-success";

export const metadata: Metadata = {
  title: { absolute: "Xico Clean" },
  robots: { index: false, follow: false },
};

export default async function MacBuySuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order_no?: string }>;
}) {
  const { locale } = await params;
  const { order_no } = await searchParams;
  setRequestLocale(locale);
  return <BuySuccess orderNo={order_no ?? null} />;
}
