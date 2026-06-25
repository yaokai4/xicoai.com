import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

export function mailEnabled() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PASS);
}

let transporter: Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: String(process.env.SMTP_SECURE ?? "true") === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

type MailArgs = {
  to?: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

/** Sends mail if SMTP is configured; otherwise a no-op (submission still stored). */
export async function sendMail({ to, subject, text, html, replyTo }: MailArgs) {
  if (!mailEnabled()) return { skipped: true as const };
  const from = `XICO <${process.env.SMTP_USER}>`;
  const recipient = to || process.env.NOTIFY_TO || process.env.SMTP_USER;
  await getTransporter().sendMail({
    from,
    to: recipient,
    subject,
    text,
    html,
    replyTo,
  });
  return { sent: true as const };
}

export function notifyAddress() {
  return process.env.NOTIFY_TO || process.env.SMTP_USER || "";
}
