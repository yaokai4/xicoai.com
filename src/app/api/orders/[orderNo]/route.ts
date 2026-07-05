import { NextResponse } from "next/server";
import { getIssuedKeyForOrder } from "@/lib/license/issue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Poll an order by its unguessable `orderNo` (also the Stripe metadata). The
 * success page hits this every couple seconds until the webhook flips the order
 * to `paid` and the key is minted. The key is ALSO emailed, so revealing it to
 * whoever holds the order token is acceptable for this one-time purchase.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderNo: string }> },
) {
  const { orderNo } = await params;
  if (!orderNo || orderNo.length > 64) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  try {
    const result = await getIssuedKeyForOrder(orderNo);
    if (!result) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json(
      { status: result.status, key: result.key },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (e) {
    console.error("order poll failed", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
