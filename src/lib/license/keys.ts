import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  randomInt,
} from "node:crypto";

/**
 * Activation-key crypto for Xico Clean.
 *
 * A key is an 18-digit numeric code shown to the buyer (grouped 6-6-6 for
 * readability). We NEVER store the plaintext:
 *   - `hashKey`    → HMAC-SHA256, the unique lookup handle stored in key_hash
 *   - `encryptKey` → AES-256-GCM, reversible so the success page / a resend can
 *                    re-reveal the exact code from key_encrypted
 *   - last4        → for support ("your key ending in 1234")
 *
 * All of this keys off LICENSE_KEY_SECRET (must be long & stable; changing it
 * orphans every previously issued key, exactly like a password pepper).
 */

const KEY_DIGITS = 18;

function keySecret(): string {
  const value = process.env.LICENSE_KEY_SECRET;
  if (!value || value.length < 24) {
    throw new Error("LICENSE_KEY_SECRET must be set to at least 24 characters.");
  }
  return value;
}

function encryptionKey(): Buffer {
  // Derive a fixed 32-byte AES key from the shared secret.
  return createHash("sha256").update(keySecret()).digest();
}

export function normalizeKey(value: string): string {
  return (value || "").replace(/\D/g, "");
}

/** 123456789012345678 → 123456-789012-345678 */
export function formatKey(value: string): string {
  return normalizeKey(value).replace(/(\d{6})(?=\d)/g, "$1-");
}

export function isValidKeyShape(value: string): boolean {
  return normalizeKey(value).length === KEY_DIGITS;
}

export function generateKeyCode(): string {
  return Array.from({ length: KEY_DIGITS }, () => randomInt(0, 10)).join("");
}

export function hashKey(value: string): string {
  return createHmac("sha256", keySecret())
    .update(normalizeKey(value))
    .digest("hex");
}

export function encryptKey(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const enc = Buffer.concat([
    cipher.update(normalizeKey(value), "utf8"),
    cipher.final(),
  ]);
  return [
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    enc.toString("base64url"),
  ].join(".");
}

export function decryptKey(stored: string): string {
  const [ivB64, tagB64, encB64] = (stored || "").split(".");
  if (!ivB64 || !tagB64 || !encB64) {
    throw new Error("Stored license key is malformed.");
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(ivB64, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encB64, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export function keyLast4(value: string): string {
  return normalizeKey(value).slice(-4);
}
