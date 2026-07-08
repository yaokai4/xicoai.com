"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { macLicenses } from "@/db/schema";
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
