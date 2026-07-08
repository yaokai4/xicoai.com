import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { macLicenses, macLicenseActivations } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Periodic online revalidation called by the app (throttled client-side).
 * Body: { licenseId: string (licenseUid), deviceId: string }
 * → { ok: true, status: "active" | "revoked" | "refunded" }
 * → { ok: false, status: "not_found" }   (unknown licenseId)
 *
 * The app is deliberately lenient: it only downgrades on an EXPLICIT
 * revoked/refunded answer — never on network failure or not_found — so an
 * offline Mac or a server hiccup can't lock out a legitimate buyer.
 */
export async function POST(req: Request) {
  let body: { licenseId?: unknown; deviceId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }
  const licenseId =
    typeof body.licenseId === "string" ? body.licenseId.trim().slice(0, 64) : "";
  const deviceId =
    typeof body.deviceId === "string" ? body.deviceId.trim().slice(0, 128) : "";
  if (!licenseId) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const db = getDb();
  const rows = await db
    .select({ id: macLicenses.id, status: macLicenses.status })
    .from(macLicenses)
    .where(eq(macLicenses.licenseUid, licenseId))
    .limit(1);
  const lic = rows[0];
  if (!lic) {
    return NextResponse.json(
      { ok: false, status: "not_found" },
      { status: 404, headers: { "cache-control": "no-store" } },
    );
  }

  if (deviceId) {
    // Best-effort heartbeat for the seat overview in /admin/licenses.
    await db
      .update(macLicenseActivations)
      .set({ lastSeenAt: new Date() })
      .where(
        and(
          eq(macLicenseActivations.licenseId, lic.id),
          eq(macLicenseActivations.deviceId, deviceId),
        ),
      );
  }

  return NextResponse.json(
    { ok: true, status: lic.status },
    { headers: { "cache-control": "no-store" } },
  );
}
