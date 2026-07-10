import { NextResponse } from "next/server";
import { deactivateLicense } from "@/lib/license/deactivate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Seat-release endpoint called by the Xico Clean macOS app's
 * "释放本机授权 / Release this device" flow before migrating to a new Mac.
 * Body: { licenseId: string (licenseUid); deviceId: string }
 * → { ok: true } on success (idempotent), or { ok: false, error } otherwise.
 */
export async function POST(req: Request) {
  let body: { licenseId?: unknown; deviceId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const licenseId = typeof body.licenseId === "string" ? body.licenseId : "";
  const deviceId = typeof body.deviceId === "string" ? body.deviceId : "";
  if (!licenseId || !deviceId) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  let result;
  try {
    result = await deactivateLicense({ licenseId, deviceId });
  } catch (e) {
    console.error("deactivate failed", e);
    return NextResponse.json({ ok: false, error: "server" }, { status: 500 });
  }

  if (result.ok) {
    return NextResponse.json(result, {
      headers: { "cache-control": "no-store" },
    });
  }
  const status = result.error === "not_found" ? 404 : 400;
  return NextResponse.json(result, { status });
}
