import "server-only";

import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { macLicenses, macLicenseActivations } from "@/db/schema";
import type { MacLicensePlan } from "@/db/schema";
import { hashKey, isValidKeyShape } from "@/lib/license/keys";
import { signLicenseEnvelope } from "@/lib/license/sign";

export type ActivateInput = {
  key: string;
  deviceId: string;
  deviceName?: string | null;
};

export type ActivateResult =
  | {
      ok: true;
      /** The signed license envelope JSON the app writes & verifies offline. */
      license: string;
      plan: MacLicensePlan;
      seats: number;
      used: number;
    }
  | {
      ok: false;
      /** invalid | not_found | refunded | revoked | seat_limit */
      error: string;
      seats?: number;
    };

/**
 * Validate an activation key, bind the requesting device to a seat, and return
 * a freshly signed license envelope. Re-activating the same device is free;
 * a new device consumes a seat until `seats` is reached.
 */
export async function activateLicense(
  input: ActivateInput,
): Promise<ActivateResult> {
  if (!isValidKeyShape(input.key)) return { ok: false, error: "invalid" };
  const deviceId = String(input.deviceId || "").trim().slice(0, 128);
  if (!deviceId) return { ok: false, error: "invalid" };

  const db = getDb();
  const licRows = await db
    .select()
    .from(macLicenses)
    .where(eq(macLicenses.keyHash, hashKey(input.key)))
    .limit(1);
  const lic = licRows[0];
  if (!lic) return { ok: false, error: "not_found" };
  if (lic.status !== "active") return { ok: false, error: lic.status };

  const deviceName = input.deviceName?.slice(0, 128) || null;

  const bound = await db.transaction(async (tx) => {
    const acts = await tx
      .select()
      .from(macLicenseActivations)
      .where(eq(macLicenseActivations.licenseId, lic.id));
    const already = acts.find((a) => a.deviceId === deviceId);
    if (already) {
      await tx
        .update(macLicenseActivations)
        .set({ lastSeenAt: new Date(), deviceName: deviceName ?? already.deviceName })
        .where(eq(macLicenseActivations.id, already.id));
      return { seatOk: true as const, count: acts.length };
    }
    if (acts.length >= lic.seats) return { seatOk: false as const, count: acts.length };
    await tx
      .insert(macLicenseActivations)
      .values({ licenseId: lic.id, deviceId, deviceName })
      .onConflictDoNothing();
    const count = acts.length + 1;
    await tx
      .update(macLicenses)
      .set({ activatedCount: count, updatedAt: new Date() })
      .where(eq(macLicenses.id, lic.id));
    return { seatOk: true as const, count };
  });

  if (!bound.seatOk) return { ok: false, error: "seat_limit", seats: lic.seats };

  const license = signLicenseEnvelope({
    licenseId: lic.licenseUid,
    customerName: lic.email || "Xico Clean Pro",
    maxMajorVersion: lic.maxMajorVersion,
  });
  return { ok: true, license, plan: lic.plan, seats: lic.seats, used: bound.count };
}
