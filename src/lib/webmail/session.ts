import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { cookies } from "next/headers";
import type { Credentials } from "@/lib/webmail/jmap";

/**
 * Webmail end-user session. On login we verify the mailbox credentials against
 * Stalwart (jmapSession), then store them AES-256-GCM encrypted inside an
 * httpOnly cookie. The browser never sees the password; the BFF decrypts it
 * per request to proxy JMAP. Encryption key is derived from AUTH_SECRET, so a
 * stolen cookie is useless without the server key.
 */

export const WEBMAIL_COOKIE = "xico_mail";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function key(): Buffer {
  const secret = process.env.AUTH_SECRET || "dev-insecure-secret-change-me-please";
  return createHash("sha256").update(`webmail:${secret}`).digest();
}

function seal(cred: Credentials): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([
    cipher.update(JSON.stringify(cred), "utf8"),
    cipher.final(),
  ]);
  return [
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    enc.toString("base64url"),
  ].join(".");
}

function unseal(token: string | undefined): Credentials | null {
  if (!token) return null;
  const [ivB64, tagB64, encB64] = token.split(".");
  if (!ivB64 || !tagB64 || !encB64) return null;
  try {
    const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(ivB64, "base64url"));
    decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
    const dec = Buffer.concat([
      decipher.update(Buffer.from(encB64, "base64url")),
      decipher.final(),
    ]).toString("utf8");
    const cred = JSON.parse(dec) as Credentials;
    if (cred?.email && cred?.password) return cred;
    return null;
  } catch {
    return null;
  }
}

export async function setWebmailSession(cred: Credentials): Promise<void> {
  (await cookies()).set(WEBMAIL_COOKIE, seal(cred), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getWebmailCredentials(): Promise<Credentials | null> {
  return unseal((await cookies()).get(WEBMAIL_COOKIE)?.value);
}

export async function clearWebmailSession(): Promise<void> {
  (await cookies()).delete(WEBMAIL_COOKIE);
}

/** Is this address a mail super-admin (can manage users)? */
export function isMailAdmin(email: string): boolean {
  const admins = (process.env.MAIL_ADMINS || "admin@xicoai.com")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.trim().toLowerCase());
}
