/**
 * xicoai-mailer — the self-hosted mail engine (one small container):
 *
 *   INBOUND  : an SMTP listener (:2525 in-container, host :25) accepts mail
 *              for MAIL_DOMAINS (catch-all — unlimited addresses, no per-user
 *              mailbox fees), parses it and stores it into Postgres
 *              (mail_messages, direction "in"); attachments land on the
 *              /data volume. Read & reply from the site's /admin/mail.
 *              Goes live once DNS MX + the Lightsail firewall allow port 25.
 *
 *   OUTBOUND : drains the mail_outbox queue the website INSERTs into.
 *              MAIL_TRANSPORT=relay  → authenticated SMTP (Aliyun; From must
 *                                      equal SMTP_USER per Aliyun policy)
 *              MAIL_TRANSPORT=direct → per-domain MX lookup + port-25 push,
 *                                      DKIM-signed (needs AWS to unblock
 *                                      outbound 25 + the DKIM DNS record)
 *              Throttled (MAIL_RATE_PER_MIN, default 30) so marketing blasts
 *              never trip relay rate limits. 5 attempts then failed.
 *
 * Deliberately no IMAP/POP: the admin inbox IS the mail client.
 */

import { createRequire } from "node:module";
import { promises as dns } from "node:dns";
import fs from "node:fs";
import path from "node:path";
import { simpleParser } from "mailparser";
import nodemailer from "nodemailer";
import postgres from "postgres";

const require = createRequire(import.meta.url);
const { SMTPServer } = require("smtp-server");

/* ── config ────────────────────────────────────────────────── */

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const MAIL_DOMAINS = (process.env.MAIL_DOMAINS || "xicoai.com,mac.xicoai.com")
  .split(",")
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean);

const TRANSPORT = process.env.MAIL_TRANSPORT === "direct" ? "direct" : "relay";
const RATE_PER_MIN = Math.max(1, Number(process.env.MAIL_RATE_PER_MIN || 30));
const SMTP_LISTEN_PORT = Number(process.env.MAIL_LISTEN_PORT || 2525);
const DATA_DIR = process.env.MAIL_DATA_DIR || "/data";
const HELO_NAME = process.env.MAIL_HELO || "mail.xicoai.com";
const MAX_ATTEMPTS = 5;

// From: Aliyun relay requires From == authenticated account.
const FROM_ADDRESS =
  TRANSPORT === "relay"
    ? process.env.SMTP_USER
    : process.env.MAIL_FROM || `no-reply@${MAIL_DOMAINS[0]}`;
const FROM_NAME = process.env.MAIL_FROM_NAME || "Xico Clean";

// Optional DKIM signing (publish the TXT from scripts/gen-dkim.mjs first!).
const DKIM_DOMAIN = process.env.MAIL_DKIM_DOMAIN || MAIL_DOMAINS[0];
const DKIM_SELECTOR = process.env.MAIL_DKIM_SELECTOR || "xico";
const DKIM_KEY_FILE = process.env.MAIL_DKIM_KEY_FILE || "/data/dkim-private.pem";
let dkim = null;
if (process.env.MAIL_DKIM === "1") {
  try {
    const privateKey =
      process.env.MAIL_DKIM_PRIVATE_KEY || fs.readFileSync(DKIM_KEY_FILE, "utf8");
    dkim = { domainName: DKIM_DOMAIN, keySelector: DKIM_SELECTOR, privateKey };
    console.log(`DKIM signing enabled (${DKIM_SELECTOR}._domainkey.${DKIM_DOMAIN})`);
  } catch (e) {
    console.error("MAIL_DKIM=1 but no key available:", e.message);
  }
}

const sql = postgres(DATABASE_URL, { max: 3 });

/* ── inbound: SMTP listener → mail_messages ────────────────── */

function rcptAccepted(address) {
  const domain = address.split("@")[1]?.toLowerCase();
  return Boolean(domain && MAIL_DOMAINS.includes(domain));
}

async function storeInbound(parsed, session) {
  const rcpt = session.envelope.rcptTo.map((r) => r.address.toLowerCase());
  const inserted = await sql`
    INSERT INTO mail_messages (direction, from_email, from_name, to_email, rcpt,
                               subject, text, html, message_id, in_reply_to)
    VALUES ('in',
            ${parsed.from?.value?.[0]?.address?.toLowerCase() ?? session.envelope.mailFrom?.address ?? null},
            ${parsed.from?.value?.[0]?.name || null},
            ${rcpt[0] ?? null},
            ${sql.json(rcpt)},
            ${parsed.subject || "(无主题)"},
            ${parsed.text || null},
            ${parsed.html || null},
            ${parsed.messageId || null},
            ${parsed.inReplyTo || null})
    RETURNING id`;
  const id = inserted[0].id;

  const attachments = [];
  for (const [i, att] of (parsed.attachments || []).entries()) {
    const safe = (att.filename || `attachment-${i}`).replace(/[^\w.\-一-鿿]/g, "_").slice(0, 120);
    const rel = path.join("attachments", String(id), safe);
    const abs = path.join(DATA_DIR, rel);
    await fs.promises.mkdir(path.dirname(abs), { recursive: true });
    await fs.promises.writeFile(abs, att.content);
    attachments.push({
      filename: safe,
      path: rel,
      size: att.size ?? att.content.length,
      contentType: att.contentType || "application/octet-stream",
    });
  }
  if (attachments.length) {
    await sql`UPDATE mail_messages SET attachments = ${sql.json(attachments)} WHERE id = ${id}`;
  }
  console.log(`⬅︎ inbound #${id} from ${parsed.from?.value?.[0]?.address} to ${rcpt.join(",")}`);
}

// Stalwart owns the real MX/IMAP now; this raw listener is kept only for
// environments without it (MAIL_INBOUND=1).
if (process.env.MAIL_INBOUND === "1") {
  const server = new SMTPServer({
    name: HELO_NAME,
    banner: "xicoai mail",
    authOptional: true,
    disabledCommands: ["AUTH"],
    disableReverseLookup: true,
    size: 25 * 1024 * 1024,
    onRcptTo(address, _session, cb) {
      if (rcptAccepted(address.address)) return cb();
      const err = new Error("5.1.1 Mailbox not found");
      err.responseCode = 550;
      return cb(err);
    },
    onData(stream, session, cb) {
      simpleParser(stream)
        .then((parsed) => storeInbound(parsed, session))
        .then(() => cb())
        .catch((e) => {
          console.error("inbound store failed", e);
          const err = new Error("4.3.0 Temporary failure, try again");
          err.responseCode = 451;
          cb(err);
        });
    },
  });
  server.on("error", (e) => console.error("smtp server error", e.message));
  server.listen(SMTP_LISTEN_PORT, () =>
    console.log(`SMTP inbound listening on :${SMTP_LISTEN_PORT} for ${MAIL_DOMAINS.join(", ")}`),
  );
}

/* ── IMAP mirror: hi@ mailbox → /admin/mail web inbox ──────── */
// Peeks (never marks read) new messages in the Stalwart mailbox and copies
// them into mail_messages so the site's inbox keeps working alongside real
// mail clients. UID cursor lives in the settings KV.

const MIRROR_HOST = process.env.MAIL_MIRROR_HOST || "stalwart";
const MIRROR_USER = process.env.MAIL_MIRROR_USER || "";
const MIRROR_PASS = process.env.MAIL_MIRROR_PASS || "";
const MIRROR_KEY = `mail_mirror_uid:${MIRROR_USER}`;

async function mirrorTick() {
  if (!MIRROR_USER || !MIRROR_PASS) return;
  const { ImapFlow } = await import("imapflow");
  const client = new ImapFlow({
    host: MIRROR_HOST,
    port: 993,
    secure: true,
    tls: { rejectUnauthorized: false }, // internal docker hop
    auth: { user: MIRROR_USER, pass: MIRROR_PASS },
    logger: false,
  });
  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
    try {
      const row = await sql`SELECT value FROM settings WHERE key = ${MIRROR_KEY}`;
      let lastUid = Number(row[0]?.value || 0);
      const status = await client.status("INBOX", { uidNext: true });
      if (status.uidNext && status.uidNext <= lastUid + 1) return;

      for await (const msg of client.fetch(
        { uid: `${lastUid + 1}:*` },
        { uid: true, source: true },
        { uid: true },
      )) {
        if (msg.uid <= lastUid) continue; // "*" can echo the last seen message
        const parsed = await simpleParser(msg.source);
        await sql`
          INSERT INTO mail_messages (direction, from_email, from_name, to_email, rcpt,
                                     subject, text, html, message_id, in_reply_to)
          VALUES ('in',
                  ${parsed.from?.value?.[0]?.address?.toLowerCase() ?? null},
                  ${parsed.from?.value?.[0]?.name || null},
                  ${MIRROR_USER},
                  ${sql.json([MIRROR_USER])},
                  ${parsed.subject || "(无主题)"},
                  ${parsed.text || null},
                  ${parsed.html || null},
                  ${parsed.messageId || null},
                  ${parsed.inReplyTo || null})`;
        lastUid = msg.uid;
        console.log(`⬅︎ mirrored uid ${msg.uid}: ${parsed.subject ?? ""}`);
      }
      await sql`
        INSERT INTO settings (key, value, updated_at) VALUES (${MIRROR_KEY}, ${String(lastUid)}, now())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`;
    } finally {
      lock.release();
    }
  } catch (e) {
    // Quiet while Stalwart boots or the mailbox doesn't exist yet.
    if (!String(e.message).includes("ECONNREFUSED")) {
      console.error("imap mirror error:", e.message);
    }
  } finally {
    try { await client.logout(); } catch { /* closed */ }
  }
}
if (MIRROR_USER && MIRROR_PASS) {
  setInterval(mirrorTick, 60_000);
  mirrorTick();
  console.log(`IMAP mirror active: ${MIRROR_USER}@${MIRROR_HOST} → web inbox`);
} else {
  console.log("IMAP mirror idle (set MAIL_MIRROR_USER / MAIL_MIRROR_PASS)");
}

/* ── outbound: mail_outbox queue → SMTP ────────────────────── */

function relayConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PASS && process.env.SMTP_USER);
}

let relayTransport = null;
function getRelay() {
  if (!relayTransport) {
    relayTransport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: String(process.env.SMTP_SECURE ?? "true") === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      ...(dkim ? { dkim } : {}),
    });
  }
  return relayTransport;
}

const mxCache = new Map();
async function mxHost(domain) {
  const cached = mxCache.get(domain);
  if (cached && cached.until > Date.now()) return cached.host;
  const records = await dns.resolveMx(domain);
  if (!records?.length) throw new Error(`no MX for ${domain}`);
  const host = records.sort((a, b) => a.priority - b.priority)[0].exchange;
  mxCache.set(domain, { host, until: Date.now() + 10 * 60_000 });
  return host;
}

async function sendDirect(message) {
  const domain = message.to.split("@")[1];
  const host = await mxHost(domain);
  const transport = nodemailer.createTransport({
    host,
    port: 25,
    secure: false,
    name: HELO_NAME,
    connectionTimeout: 20_000,
    tls: { rejectUnauthorized: false },
    ...(dkim ? { dkim } : {}),
  });
  try {
    return await transport.sendMail(message);
  } finally {
    transport.close();
  }
}

async function deliver(row) {
  const headers = row.headers || {};
  const message = {
    from: { name: FROM_NAME, address: FROM_ADDRESS },
    to: row.to_email,
    subject: row.subject,
    text: row.text,
    html: row.html || undefined,
    headers,
  };
  if (TRANSPORT === "relay") {
    if (!relayConfigured()) throw new Error("relay not configured (SMTP_PASS empty)");
    return getRelay().sendMail(message);
  }
  return sendDirect(message);
}

let draining = false;
async function drainOutbox() {
  if (draining) return;
  draining = true;
  try {
    const batch = Math.max(1, Math.round(RATE_PER_MIN / 12)); // per 5s tick
    const rows = await sql`
      UPDATE mail_outbox SET status = 'sending', attempts = attempts + 1
      WHERE id IN (
        SELECT id FROM mail_outbox
        WHERE status = 'queued' AND next_attempt_at <= now()
        ORDER BY id LIMIT ${batch} FOR UPDATE SKIP LOCKED)
      RETURNING *`;

    for (const row of rows) {
      try {
        const info = await deliver(row);
        await sql`
          UPDATE mail_outbox
          SET status = 'sent', sent_at = now(), message_id = ${info.messageId ?? null}, last_error = NULL
          WHERE id = ${row.id}`;
        await sql`
          INSERT INTO mail_messages (direction, from_email, from_name, to_email,
                                     subject, text, html, message_id, unread, outbox_id)
          VALUES ('out', ${FROM_ADDRESS}, ${FROM_NAME}, ${row.to_email},
                  ${row.subject}, ${row.text}, ${row.html}, ${info.messageId ?? null}, false, ${row.id})`;
        console.log(`➡︎ sent #${row.id} to ${row.to_email}`);
      } catch (e) {
        const failedForGood = row.attempts >= MAX_ATTEMPTS;
        // Exponential backoff: 2min, 8min, 18min, 32min between retries — a
        // relay outage or missing SMTP_PASS shouldn't burn attempts in seconds.
        const backoffMin = 2 * row.attempts * row.attempts;
        await sql`
          UPDATE mail_outbox
          SET status = ${failedForGood ? "failed" : "queued"},
              next_attempt_at = now() + ${backoffMin + " minutes"}::interval,
              last_error = ${String(e.message || e).slice(0, 500)}
          WHERE id = ${row.id}`;
        console.error(`✗ send #${row.id} attempt ${row.attempts} failed: ${e.message}`);
      }
    }
  } catch (e) {
    console.error("drainOutbox error", e);
  } finally {
    draining = false;
  }
}

// Reset rows stuck in 'sending' after a crash/restart.
await sql`UPDATE mail_outbox SET status = 'queued' WHERE status = 'sending'`;
setInterval(drainOutbox, 5000);
console.log(
  `Outbox worker: transport=${TRANSPORT}${TRANSPORT === "relay" ? (relayConfigured() ? " (configured)" : " (WAITING for SMTP_PASS)") : ""}, ` +
  `rate=${RATE_PER_MIN}/min, from=${FROM_ADDRESS ?? "(unset)"}`,
);
