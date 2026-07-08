import "server-only";

import { getDb } from "@/db";
import { mailOutbox } from "@/db/schema";
import { renderEmailHtml } from "@/lib/mailer/template";

/**
 * Outbound mail = INSERT into the mail_outbox queue; the standalone mailer
 * worker container does the actual SMTP work (Aliyun relay today, DKIM-signed
 * direct delivery once port 25 is unblocked). Queuing always succeeds even
 * while the transport is unconfigured — messages simply wait, nothing is lost,
 * and a web request is never blocked on SMTP I/O.
 */

export function mailEnabled() {
  // Kept for callers that want to distinguish "will actually leave the box".
  return Boolean(
    (process.env.SMTP_HOST && process.env.SMTP_PASS) ||
      process.env.MAIL_TRANSPORT === "direct",
  );
}

type MailArgs = {
  to?: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  kind?: "transactional" | "campaign" | "reply" | "compose";
  campaignId?: number;
  headers?: Record<string, string>;
};

/** Queue a message. Renders the branded HTML wrapper when none is provided. */
export async function sendMail({
  to,
  subject,
  text,
  html,
  replyTo,
  kind = "transactional",
  campaignId,
  headers,
}: MailArgs) {
  const recipient = to || process.env.NOTIFY_TO || process.env.SMTP_USER;
  if (!recipient) return { skipped: true as const };

  const mergedHeaders: Record<string, string> = { ...(headers ?? {}) };
  if (replyTo) mergedHeaders["Reply-To"] = replyTo;

  await getDb()
    .insert(mailOutbox)
    .values({
      kind,
      campaignId,
      toEmail: recipient,
      subject: subject.slice(0, 512),
      text,
      html: html ?? renderEmailHtml({ title: subject, bodyText: text }),
      headers: Object.keys(mergedHeaders).length ? mergedHeaders : null,
    });
  return { queued: true as const };
}

export function notifyAddress() {
  return process.env.NOTIFY_TO || process.env.SMTP_USER || "";
}
