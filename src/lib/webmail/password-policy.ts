import "server-only";

import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { mailPasswordPolicy } from "@/db/schema";

/** Does this mailbox still need to change its password before use? */
export async function mustChangePassword(email: string): Promise<boolean> {
  const rows = await getDb()
    .select({ mustChange: mailPasswordPolicy.mustChange })
    .from(mailPasswordPolicy)
    .where(eq(mailPasswordPolicy.email, email.toLowerCase()))
    .limit(1);
  return rows[0]?.mustChange ?? false;
}

/** Mark that a mailbox must change its password on next use (admin create/reset). */
export async function requirePasswordChange(email: string): Promise<void> {
  const e = email.toLowerCase();
  await getDb()
    .insert(mailPasswordPolicy)
    .values({ email: e, mustChange: true, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: mailPasswordPolicy.email,
      set: { mustChange: true, updatedAt: new Date() },
    });
}

/** Clear the forced-change flag (user self-changed their password). */
export async function clearPasswordChange(email: string): Promise<void> {
  const e = email.toLowerCase();
  await getDb()
    .insert(mailPasswordPolicy)
    .values({ email: e, mustChange: false, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: mailPasswordPolicy.email,
      set: { mustChange: false, updatedAt: new Date() },
    });
}
