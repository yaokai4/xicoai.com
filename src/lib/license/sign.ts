import "server-only";

import { createPrivateKey, createPublicKey, sign as edSign } from "node:crypto";

/**
 * Mint an Ed25519-signed license envelope that the Xico Clean macOS app
 * (`LicenseService.decodeVerifiedPayload`) verifies OFFLINE with its embedded
 * public key. This is the interop contract — every detail here mirrors the app:
 *
 *  Envelope JSON = { keyID, payloadBase64, signatureBase64 }   (standard base64)
 *  signature     = Ed25519 over the RAW payload bytes (the bytes that base64 to
 *                  payloadBase64) — CryptoKit's `isValidSignature(sig, for: data)`.
 *  payload JSON  = LicensePayload decoded by Swift's DEFAULT JSONDecoder, so:
 *                    - dates use `.deferredToDate` → a Double of seconds since
 *                      2001-01-01 UTC (NOT unix, NOT ISO). expiresAt omitted =
 *                      perpetual (Swift optional → nil).
 *                    - keys sorted (mirrors the app's sign_license.swift tool).
 *                    - productID MUST equal the app's productID ("com.xico.app").
 *
 * The private key is the raw 32-byte Curve25519 seed (base64) printed by the
 * app's `scripts/sign_license.swift --generate-keypair`; its public half is
 * injected into the app's Info.plist. Keep the private key server-only.
 */

// Seconds between the Unix epoch and Apple's reference date (2001-01-01 UTC).
const APPLE_EPOCH_OFFSET = 978_307_200;

// DER prefix that wraps a raw 32-byte Ed25519 seed into a PKCS#8 private key,
// so Node's crypto can load the same seed CryptoKit uses.
const ED25519_PKCS8_PREFIX = Buffer.from(
  "302e020100300506032b657004220420",
  "hex",
);

const PRODUCT_ID = process.env.XICO_LICENSE_PRODUCT_ID || "com.xico.app";

export function licenseKeyId(): string {
  return process.env.XICO_LICENSE_KEY_ID || "xico-license-1";
}

export function licenseSigningConfigured(): boolean {
  return Boolean(process.env.XICO_LICENSE_PRIVATE_KEY);
}

function privateKeyObject() {
  const b64 = process.env.XICO_LICENSE_PRIVATE_KEY;
  if (!b64) throw new Error("XICO_LICENSE_PRIVATE_KEY is not set.");
  const seed = Buffer.from(b64.trim(), "base64");
  if (seed.length !== 32) {
    throw new Error(
      `XICO_LICENSE_PRIVATE_KEY must decode to 32 bytes (got ${seed.length}).`,
    );
  }
  return createPrivateKey({
    key: Buffer.concat([ED25519_PKCS8_PREFIX, seed]),
    format: "der",
    type: "pkcs8",
  });
}

/** Raw 32-byte public key (base64) for the given/env private key — used by the
 * keygen script and tests to confirm the app trusts the same key. */
export function publicKeyBase64(privateSeedB64?: string): string {
  const seed = Buffer.from(
    (privateSeedB64 ?? process.env.XICO_LICENSE_PRIVATE_KEY ?? "").trim(),
    "base64",
  );
  const priv = createPrivateKey({
    key: Buffer.concat([ED25519_PKCS8_PREFIX, seed]),
    format: "der",
    type: "pkcs8",
  });
  const spki = createPublicKey(priv).export({ format: "der", type: "spki" });
  // SPKI for Ed25519 is a fixed 12-byte header followed by the 32-byte key.
  return Buffer.from(spki.subarray(spki.length - 32)).toString("base64");
}

function appleTime(date: Date): number {
  return Math.floor(date.getTime() / 1000) - APPLE_EPOCH_OFFSET;
}

export type LicenseEnvelopeInput = {
  licenseId: string;
  customerName: string;
  maxMajorVersion?: number;
  /** Omit for a perpetual buy-out license (no expiry). */
  expiresAt?: Date | null;
  issuedAt?: Date;
};

/**
 * Build the canonical payload JSON string with sorted keys. We control both the
 * signed bytes and payloadBase64, so this exact string is what gets signed.
 */
function payloadJson(input: LicenseEnvelopeInput): string {
  const issued = appleTime(input.issuedAt ?? new Date());
  // Insertion order == alphabetical == Swift `.sortedKeys` output.
  const obj: Record<string, unknown> = {
    customerName: input.customerName,
  };
  if (input.expiresAt) obj.expiresAt = appleTime(input.expiresAt);
  obj.issuedAt = issued;
  obj.licenseID = input.licenseId;
  obj.maxMajorVersion = input.maxMajorVersion ?? 99;
  obj.productID = PRODUCT_ID;
  return JSON.stringify(obj);
}

/** Returns the license envelope as a JSON string — exactly the bytes the app
 * writes to `license.xico-license` and verifies. */
export function signLicenseEnvelope(input: LicenseEnvelopeInput): string {
  const payloadBytes = Buffer.from(payloadJson(input), "utf8");
  const signature = edSign(null, payloadBytes, privateKeyObject());
  const envelope = {
    keyID: licenseKeyId(),
    payloadBase64: payloadBytes.toString("base64"),
    signatureBase64: Buffer.from(signature).toString("base64"),
  };
  return JSON.stringify(envelope);
}
