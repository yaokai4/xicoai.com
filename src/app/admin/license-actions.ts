"use server";

import { revalidatePath } from "next/cache";
import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { macLicenses, macLicenseActivations } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { issueManualLicense } from "@/lib/license/issue";
import { decryptKey, formatKey } from "@/lib/license/keys";

export type GenerateState = {
  error?: string;
  /** Freshly minted key — shown ONCE, right after generation. */
  key?: string;
  licenseId?: number;
  plan?: string;
};

/** Admin console: mint a manual activation key (个人=1 台 / 家庭=5 台). */
export async function generateLicenseAction(
  _prev: GenerateState,
  formData: FormData,
): Promise<GenerateState> {
  await requireAdmin();
  const plan = formData.get("plan") === "family" ? "family" : "personal";
  const note = String(formData.get("note") ?? "").trim().slice(0, 256) || null;
  const email =
    String(formData.get("email") ?? "").trim().slice(0, 256) || null;
  try {
    const { key, licenseId } = await issueManualLicense({ plan, note, email });
    revalidatePath("/admin/licenses");
    return { key, licenseId, plan };
  } catch (e) {
    console.error("generateLicenseAction failed", e);
    return { error: "生成失败，请重试" };
  }
}

/** Flip a license between active ↔ revoked. Revoked keys refuse activation
 * immediately, and already-activated apps drop out on their next online
 * revalidation (App ≥0.2.7). */
export async function setLicenseStatusAction(
  licenseId: number,
  status: "active" | "revoked" | "refunded",
): Promise<{ error?: string }> {
  await requireAdmin();
  try {
    await getDb()
      .update(macLicenses)
      .set({ status, updatedAt: new Date() })
      .where(eq(macLicenses.id, licenseId));
    revalidatePath("/admin/licenses");
    return {};
  } catch (e) {
    console.error("setLicenseStatusAction failed", e);
    return { error: "操作失败" };
  }
}

export type DeviceRow = {
  id: number;
  deviceId: string;
  deviceName: string | null;
  createdAt: string;
  lastSeenAt: string;
};

/** List the devices (seats) that have activated a given license. */
export async function listLicenseDevicesAction(
  licenseId: number,
): Promise<{ devices?: DeviceRow[]; error?: string }> {
  await requireAdmin();
  try {
    const rows = await getDb()
      .select({
        id: macLicenseActivations.id,
        deviceId: macLicenseActivations.deviceId,
        deviceName: macLicenseActivations.deviceName,
        createdAt: macLicenseActivations.createdAt,
        lastSeenAt: macLicenseActivations.lastSeenAt,
      })
      .from(macLicenseActivations)
      .where(eq(macLicenseActivations.licenseId, licenseId))
      .orderBy(asc(macLicenseActivations.createdAt));
    return {
      devices: rows.map((r) => ({
        id: r.id,
        deviceId: r.deviceId,
        deviceName: r.deviceName ?? null,
        createdAt: r.createdAt.toISOString(),
        lastSeenAt: r.lastSeenAt.toISOString(),
      })),
    };
  } catch (e) {
    console.error("listLicenseDevicesAction failed", e);
    return { error: "读取失败" };
  }
}

/** Admin-side seat release: remove one device from a license and re-sync the
 * license's activatedCount. Frees a seat when a buyer can't reach the old Mac. */
export async function removeLicenseDeviceAction(
  licenseId: number,
  activationId: number,
): Promise<{ error?: string }> {
  await requireAdmin();
  try {
    const db = getDb();
    await db.transaction(async (tx) => {
      await tx
        .delete(macLicenseActivations)
        .where(
          and(
            eq(macLicenseActivations.id, activationId),
            eq(macLicenseActivations.licenseId, licenseId),
          ),
        );
      const left = await tx
        .select({ id: macLicenseActivations.id })
        .from(macLicenseActivations)
        .where(eq(macLicenseActivations.licenseId, licenseId));
      await tx
        .update(macLicenses)
        .set({ activatedCount: left.length, updatedAt: new Date() })
        .where(eq(macLicenses.id, licenseId));
    });
    revalidatePath("/admin/licenses");
    return {};
  } catch (e) {
    console.error("removeLicenseDeviceAction failed", e);
    return { error: "移除失败" };
  }
}

/** Re-reveal the plaintext key of an issued license (support / resend). */
export async function revealLicenseKeyAction(
  licenseId: number,
): Promise<{ key?: string; error?: string }> {
  await requireAdmin();
  try {
    const rows = await getDb()
      .select({ enc: macLicenses.keyEncrypted })
      .from(macLicenses)
      .where(eq(macLicenses.id, licenseId))
      .limit(1);
    if (!rows[0]) return { error: "不存在" };
    return { key: formatKey(decryptKey(rows[0].enc)) };
  } catch (e) {
    console.error("revealLicenseKeyAction failed", e);
    return { error: "解密失败" };
  }
}
