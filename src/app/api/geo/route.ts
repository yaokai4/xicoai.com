import { NextResponse } from "next/server";
import { clientIp, countryFromIp, detectCurrency } from "@/lib/geo";
import { getMacPricing } from "@/lib/pricing.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Echo the geo detection for the CALLER's own request — the buy page uses the
 * exact same code path. Public by design (returns only what the requester
 * already knows about themselves) and doubles as the production canary for
 * the IP database: `resolved:false` with a non-null ip means geo is broken.
 */
export async function GET(req: Request) {
  const h = new Headers(req.headers);
  const ip = clientIp(h);
  const country = countryFromIp(ip);
  const pricing = await getMacPricing();
  const currency = detectCurrency({
    country,
    locale: "en",
    available: Object.keys(pricing.currencies),
    fallback: pricing.defaultCurrency,
  });
  return NextResponse.json(
    { ip, country, resolved: country != null, currency, cwd: process.cwd() },
    { headers: { "cache-control": "no-store" } },
  );
}
