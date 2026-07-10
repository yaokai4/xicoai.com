import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { clientIp, countryFromIp, detectCurrency } from "@/lib/geo";
import { getMacPricing, planPricing } from "@/lib/pricing.server";

export const dynamic = "force-dynamic";

/**
 * Mac 客户端的价格同步端点：与购买页同一套「IP 国别 → 币种」判定与同一份
 * 管理后台价格，App 内 Pro 弹窗据此展示与官网完全一致的现价/划线价。
 * 响应刻意精简且无个人信息；不缓存（改价即时生效）。
 */
export async function GET() {
  const pricing = await getMacPricing();
  const country = countryFromIp(clientIp(await headers()));
  const currency = detectCurrency({
    country,
    locale: "zh",
    available: Object.keys(pricing.currencies),
    fallback: pricing.defaultCurrency,
  });
  return NextResponse.json(
    {
      active: pricing.active,
      currency,
      plans: {
        personal: planPricing(pricing, currency, "personal"),
        family: planPricing(pricing, currency, "family"),
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
