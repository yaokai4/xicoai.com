import { NextResponse } from "next/server";
import { activateLicense } from "@/lib/license/activate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Online activation endpoint called by the Xico Clean macOS app.
 * Body: { key: string; deviceId: string; deviceName?: string }
 * On success returns { ok: true, license } where `license` is the signed
 * envelope JSON the app writes to disk and verifies offline.
 */
export async function POST(req: Request) {
  let body: { key?: unknown; deviceId?: unknown; deviceName?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const key = typeof body.key === "string" ? body.key : "";
  const deviceId = typeof body.deviceId === "string" ? body.deviceId : "";
  const deviceName =
    typeof body.deviceName === "string" ? body.deviceName : undefined;

  if (!key || !deviceId) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  let result;
  try {
    result = await activateLicense({ key, deviceId, deviceName });
  } catch (e) {
    console.error("activate failed", e);
    return NextResponse.json({ ok: false, error: "server" }, { status: 500 });
  }

  if (result.ok) {
    return NextResponse.json(result, {
      headers: { "cache-control": "no-store" },
    });
  }

  const status =
    result.error === "not_found"
      ? 404
      : result.error === "seat_limit"
        ? 409
        : result.error === "revoked" || result.error === "refunded"
          ? 403
          : 400;
  return NextResponse.json(result, { status });
}
