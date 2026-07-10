import "server-only";

import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { macLicenses, macLicenseActivations } from "@/db/schema";

export type DeactivateInput = {
  /** The stable licenseUid the app stores (LicensePayload.licenseID). */
  licenseId: string;
  deviceId: string;
};

export type DeactivateResult =
  | { ok: true; used: number; seats: number }
  | { ok: false; error: "invalid" | "not_found" };

/**
 * Release the requesting device's seat so a new machine can activate.
 * Called by the app's "释放本机授权" flow before migrating to a new Mac.
 *
 * Idempotent: releasing a device that never held a seat still succeeds — the
 * app only needs the server-side seat freed. Recomputes `activatedCount` from
 * the surviving rows so the admin seat overview stays exact.
 */
export async function deactivateLicense(
  input: DeactivateInput,
): Promise<DeactivateResult> {
  const licenseId = String(input.licenseId || "").trim().slice(0, 64);
  const deviceId = String(input.deviceId || "").trim().slice(0, 128);
  if (!licenseId || !deviceId) return { ok: false, error: "invalid" };

  const db = getDb();
  const rows = await db
    .select({ id: macLicenses.id, seats: macLicenses.seats })
    .from(macLicenses)
    .where(eq(macLicenses.licenseUid, licenseId))
    .limit(1);
  const lic = rows[0];
  if (!lic) return { ok: false, error: "not_found" };

  const remaining = await db.transaction(async (tx) => {
    await tx
      .delete(macLicenseActivations)
      .where(
        and(
          eq(macLicenseActivations.licenseId, lic.id),
          eq(macLicenseActivations.deviceId, deviceId),
        ),
      );
    const left = await tx
      .select({ id: macLicenseActivations.id })
      .from(macLicenseActivations)
      .where(eq(macLicenseActivations.licenseId, lic.id));
    await tx
      .update(macLicenses)
      .set({ activatedCount: left.length, updatedAt: new Date() })
      .where(eq(macLicenses.id, lic.id));
    return left.length;
  });

  return { ok: true, used: remaining, seats: lic.seats };
}
