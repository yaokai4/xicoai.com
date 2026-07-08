#!/usr/bin/env node
/**
 * Generate the DKIM RSA keypair for self-hosted direct sending.
 *   node scripts/gen-dkim.mjs [domain] [selector]
 * Save the private key on the server (e.g. docker volume /data/dkim-private.pem,
 * or MAIL_DKIM_PRIVATE_KEY in .env) and publish the printed TXT record, then
 * set MAIL_DKIM=1.
 */
import { generateKeyPairSync } from "node:crypto";

const domain = process.argv[2] || "xicoai.com";
const selector = process.argv[3] || "xico";

const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
});
const priv = privateKey.export({ format: "pem", type: "pkcs8" });
const pubDer = publicKey.export({ format: "der", type: "spki" });
const p = pubDer.toString("base64");

console.log("── private key (server only — /data/dkim-private.pem) ──");
console.log(priv);
console.log("── DNS TXT record ──");
console.log(`host:  ${selector}._domainkey.${domain}`);
console.log(`value: v=DKIM1; k=rsa; p=${p}`);
