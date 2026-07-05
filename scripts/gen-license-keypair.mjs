#!/usr/bin/env node
/**
 * Generate the Ed25519 license keypair shared by:
 *   - this server  → signs license envelopes  (XICO_LICENSE_PRIVATE_KEY)
 *   - the Mac app  → verifies them offline     (XICO_LICENSE_PUBLIC_KEYS in Info.plist)
 *
 * The raw 32-byte seed / public key are exactly what the app's
 * `scripts/sign_license.swift --generate-keypair` prints, so the two stacks
 * interoperate. Run once, keep the private key secret (server env only).
 *
 *   node scripts/gen-license-keypair.mjs [keyId]
 */
import { generateKeyPairSync } from "node:crypto";

const keyId = (process.argv[2] || "xico-license-1").trim();

const { privateKey, publicKey } = generateKeyPairSync("ed25519");
// PKCS#8 DER for Ed25519 = 16-byte header + 32-byte seed.
const pkcs8 = privateKey.export({ format: "der", type: "pkcs8" });
const seed = Buffer.from(pkcs8.subarray(pkcs8.length - 32));
// SPKI DER for Ed25519 = 12-byte header + 32-byte public key.
const spki = publicKey.export({ format: "der", type: "spki" });
const pub = Buffer.from(spki.subarray(spki.length - 32));

const privB64 = seed.toString("base64");
const pubB64 = pub.toString("base64");

console.log("");
console.log("Xico Clean license keypair");
console.log("==========================");
console.log(`keyID: ${keyId}`);
console.log("");
console.log("── Server (.env on mac.xicoai.com — keep secret) ─────────────");
console.log(`XICO_LICENSE_KEY_ID=${keyId}`);
console.log(`XICO_LICENSE_PRIVATE_KEY=${privB64}`);
console.log("");
console.log("── Mac app (scripts/make_app.sh build env) ───────────────────");
console.log(`export XICO_LICENSE_PUBLIC_KEYS='${keyId}:${pubB64}'`);
console.log("");
console.log("public key (raw base64): " + pubB64);
console.log("");
