import "server-only";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { macLicenses, macOrders, type MacOrder } from "@/db/schema";
import { seatsForPlan } from "@/lib/pricing";
import {
  decryptKey,
  encryptKey,
  formatKey,
  generateKeyCode,
  hashKey,
  keyLast4,
} from "@/lib/license/keys";

/**
 * Mint (or return the already-minted) activation key for a paid order.
 * Idempotent: the unique `order_id` index means a racing second webhook
 * delivery can't create a duplicate — it re-reads and returns the same key.
 * Returns the display-formatted (6-6-6) code.
 */
export async function issueLicenseForOrder(order: MacOrder): Promise<string> {
  const db = getDb();

  const existing = await db
    .select({ enc: macLicenses.keyEncrypted })
    .from(macLicenses)
    .where(eq(macLicenses.orderId, order.id))
    .limit(1);
  if (existing[0]) return formatKey(decryptKey(existing[0].enc));

  const seats = seatsForPlan(order.plan);
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const code = generateKeyCode();
    try {
      await db.insert(macLicenses).values({
        licenseUid: randomUUID(),
        keyHash: hashKey(code),
        keyEncrypted: encryptKey(code),
        keyLast4: keyLast4(code),
        plan: order.plan,
        seats,
        email: order.email,
        orderId: order.id,
      });
      return formatKey(code);
    } catch {
      // Either a key-hash collision (retry with a new code) or a concurrent
      // delivery already issued for this order — re-check the latter.
      const now = await db
        .select({ enc: macLicenses.keyEncrypted })
        .from(macLicenses)
        .where(eq(macLicenses.orderId, order.id))
        .limit(1);
      if (now[0]) return formatKey(decryptKey(now[0].enc));
    }
  }
  throw new Error("Could not issue a unique license key after retries.");
}

/**
 * Mint an activation key by hand from the admin console (source "manual") —
 * the ONLY other legitimate origin of keys besides a paid order. Used for
 * 卡密/线下 sales, giveaways and review copies. Same crypto & retry loop as
 * purchase issuance; no order row is attached.
 */
export async function issueManualLicense(opts: {
  plan: MacOrder["plan"];
  email?: string | null;
  note?: string | null;
}): Promise<{ key: string; licenseId: number; licenseUid: string }> {
  const db = getDb();
  const seats = seatsForPlan(opts.plan);

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const code = generateKeyCode();
    const licenseUid = randomUUID();
    try {
      const inserted = await db
        .insert(macLicenses)
        .values({
          licenseUid,
          keyHash: hashKey(code),
          keyEncrypted: encryptKey(code),
          keyLast4: keyLast4(code),
          plan: opts.plan,
          seats,
          email: opts.email || null,
          note: opts.note || null,
          source: "manual",
          orderId: null,
        })
        .returning({ id: macLicenses.id });
      return { key: formatKey(code), licenseId: inserted[0].id, licenseUid };
    } catch (e) {
      // Only a key-hash unique collision justifies a retry; anything else
      // (missing LICENSE_KEY_SECRET, DB down …) must surface, not loop.
      const code23505 =
        (e as { code?: string })?.code === "23505" ||
        ((e as { cause?: { code?: string } })?.cause?.code === "23505");
      if (!code23505) throw e;
    }
  }
  throw new Error("Could not issue a unique license key after retries.");
}

/**
 * For the success page: returns the formatted key once the order is paid and a
 * key has been issued, else null (still processing).
 */
export async function getIssuedKeyForOrder(
  orderNo: string,
): Promise<{ status: MacOrder["status"]; key: string | null } | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(macOrders)
    .where(eq(macOrders.orderNo, orderNo))
    .limit(1);
  const order = rows[0];
  if (!order) return null;
  if (order.status !== "paid") return { status: order.status, key: null };

  const lic = await db
    .select({ enc: macLicenses.keyEncrypted })
    .from(macLicenses)
    .where(eq(macLicenses.orderId, order.id))
    .limit(1);
  return {
    status: order.status,
    key: lic[0] ? formatKey(decryptKey(lic[0].enc)) : null,
  };
}
