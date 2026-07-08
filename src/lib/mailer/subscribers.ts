import "server-only";

import { randomBytes } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { mailSubscribers } from "@/db/schema";

/**
 * Add someone to the address book (idempotent). Buyers and waitlist signups
 * are captured automatically; a previously unsubscribed address is NEVER
 * silently re-subscribed.
 */
export async function upsertSubscriber(opts: {
  email: string;
  name?: string | null;
  locale?: string | null;
  source: "order" | "waitlist" | "manual" | "import";
}): Promise<void> {
  const email = opts.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
  const db = getDb();
  await db
    .insert(mailSubscribers)
    .values({
      email,
      name: opts.name?.slice(0, 128) || null,
      locale: opts.locale?.slice(0, 8) || null,
      source: opts.source,
      token: randomBytes(24).toString("base64url"),
    })
    .onConflictDoUpdate({
      target: mailSubscribers.email,
      set: {
        // Fill blanks only; keep status & token untouched (no re-subscribe).
        name: sql`COALESCE(${mailSubscribers.name}, EXCLUDED.name)`,
        locale: sql`COALESCE(${mailSubscribers.locale}, EXCLUDED.locale)`,
        updatedAt: new Date(),
      },
    });
}

export function unsubscribeUrlFor(token: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://xicoai.com";
  return `${base}/api/mail/unsubscribe?token=${encodeURIComponent(token)}`;
}

export async function unsubscribeByToken(token: string): Promise<boolean> {
  if (!token) return false;
  const db = getDb();
  const rows = await db
    .update(mailSubscribers)
    .set({ status: "unsubscribed", updatedAt: new Date() })
    .where(eq(mailSubscribers.token, token))
    .returning({ id: mailSubscribers.id });
  return rows.length > 0;
}
