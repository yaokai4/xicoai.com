"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import {
  mailCampaigns,
  mailMessages,
  mailOutbox,
  mailSubscribers,
} from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { sendMail, notifyAddress } from "@/lib/mail";
import { renderEmailHtml } from "@/lib/mailer/template";
import {
  upsertSubscriber,
  unsubscribeUrlFor,
} from "@/lib/mailer/subscribers";

export type MailActionState = { error?: string; ok?: boolean; info?: string };

/* ── 写信 / 回复 ───────────────────────────────────────────── */

export async function composeMailAction(
  _prev: MailActionState,
  formData: FormData,
): Promise<MailActionState> {
  await requireAdmin();
  const to = String(formData.get("to") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return { error: "收件人邮箱无效" };
  if (!subject || !body) return { error: "主题和正文不能为空" };

  await sendMail({ to, subject, text: body, kind: "compose" });
  revalidatePath("/admin/mail");
  return { ok: true, info: "已加入发送队列" };
}

export async function replyMailAction(
  _prev: MailActionState,
  formData: FormData,
): Promise<MailActionState> {
  await requireAdmin();
  const messageId = Number(formData.get("messageId"));
  const body = String(formData.get("body") ?? "").trim();
  if (!Number.isInteger(messageId) || !body) return { error: "内容不能为空" };

  const db = getDb();
  const rows = await db
    .select()
    .from(mailMessages)
    .where(eq(mailMessages.id, messageId))
    .limit(1);
  const original = rows[0];
  if (!original || original.direction !== "in" || !original.fromEmail) {
    return { error: "原始邮件不存在" };
  }

  const subject = original.subject?.startsWith("Re:")
    ? original.subject
    : `Re: ${original.subject ?? ""}`;
  await sendMail({
    to: original.fromEmail,
    subject,
    text: body,
    kind: "reply",
    headers: original.messageId
      ? { "In-Reply-To": original.messageId, References: original.messageId }
      : undefined,
  });
  await db
    .update(mailMessages)
    .set({ unread: false })
    .where(eq(mailMessages.id, messageId));
  revalidatePath("/admin/mail");
  return { ok: true, info: "回复已加入发送队列" };
}

export async function setMessageFlagsAction(
  id: number,
  flags: { unread?: boolean; archived?: boolean },
): Promise<{ error?: string }> {
  await requireAdmin();
  await getDb()
    .update(mailMessages)
    .set(flags)
    .where(eq(mailMessages.id, id));
  revalidatePath("/admin/mail");
  return {};
}

/* ── 营销活动 ─────────────────────────────────────────────── */

export async function createCampaignAction(
  _prev: MailActionState,
  formData: FormData,
): Promise<MailActionState> {
  await requireAdmin();
  const subject = String(formData.get("subject") ?? "").trim().slice(0, 256);
  const preheader =
    String(formData.get("preheader") ?? "").trim().slice(0, 256) || null;
  const bodyText = String(formData.get("body") ?? "").trim();
  const audienceRaw = String(formData.get("audience") ?? "subscribed");
  const audience = ["subscribed", "purchasers", "waitlist"].includes(audienceRaw)
    ? audienceRaw
    : "subscribed";
  if (!subject || !bodyText) return { error: "主题和正文不能为空" };

  await getDb()
    .insert(mailCampaigns)
    .values({ subject, preheader, bodyText, audience });
  revalidatePath("/admin/mail/campaigns");
  return { ok: true };
}

function audienceFilter(audience: string) {
  const subscribed = eq(mailSubscribers.status, "subscribed");
  if (audience === "purchasers")
    return and(subscribed, eq(mailSubscribers.source, "order"));
  if (audience === "waitlist")
    return and(subscribed, eq(mailSubscribers.source, "waitlist"));
  return subscribed;
}

/** 给自己发一封测试（送到 NOTIFY_TO），不动订阅者。 */
export async function testCampaignAction(
  campaignId: number,
): Promise<MailActionState> {
  await requireAdmin();
  const db = getDb();
  const rows = await db
    .select()
    .from(mailCampaigns)
    .where(eq(mailCampaigns.id, campaignId))
    .limit(1);
  const c = rows[0];
  if (!c) return { error: "活动不存在" };
  const to = notifyAddress();
  if (!to) return { error: "未配置 NOTIFY_TO" };
  await sendMail({
    to,
    subject: `[测试] ${c.subject}`,
    text: c.bodyText,
    html: renderEmailHtml({ title: c.subject, bodyText: c.bodyText }),
    kind: "campaign",
    campaignId: c.id,
  });
  return { ok: true, info: `测试邮件已入队 → ${to}` };
}

/** 正式群发：把每位收件人的个性化邮件写入发送队列。 */
export async function sendCampaignAction(
  campaignId: number,
): Promise<MailActionState> {
  await requireAdmin();
  const db = getDb();
  const rows = await db
    .select()
    .from(mailCampaigns)
    .where(eq(mailCampaigns.id, campaignId))
    .limit(1);
  const c = rows[0];
  if (!c) return { error: "活动不存在" };
  if (c.status !== "draft") return { error: "该活动已发送过" };

  const recipients = await db
    .select()
    .from(mailSubscribers)
    .where(audienceFilter(c.audience));
  if (!recipients.length) return { error: "该受众下没有可发送的订阅者" };

  // Mark queued FIRST so a double-click can't blast twice.
  const claimed = await db
    .update(mailCampaigns)
    .set({ status: "queued", totalQueued: recipients.length, sentAt: new Date() })
    .where(and(eq(mailCampaigns.id, campaignId), eq(mailCampaigns.status, "draft")))
    .returning({ id: mailCampaigns.id });
  if (!claimed.length) return { error: "该活动已发送过" };

  const CHUNK = 500;
  for (let i = 0; i < recipients.length; i += CHUNK) {
    const slice = recipients.slice(i, i + CHUNK);
    await db.insert(mailOutbox).values(
      slice.map((r) => {
        const unsub = unsubscribeUrlFor(r.token);
        return {
          kind: "campaign" as const,
          campaignId: c.id,
          toEmail: r.email,
          subject: c.subject,
          text: `${c.bodyText}\n\n——\n退订 / Unsubscribe: ${unsub}`,
          html: renderEmailHtml({
            title: c.subject,
            bodyText: c.bodyText,
            locale: r.locale,
            unsubscribeUrl: unsub,
          }),
          headers: {
            "List-Unsubscribe": `<${unsub}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        };
      }),
    );
  }

  revalidatePath("/admin/mail/campaigns");
  return { ok: true, info: `已入队 ${recipients.length} 封，worker 将按限速发送` };
}

/* ── 订阅者 ───────────────────────────────────────────────── */

export async function importSubscribersAction(
  _prev: MailActionState,
  formData: FormData,
): Promise<MailActionState> {
  await requireAdmin();
  const raw = String(formData.get("list") ?? "");
  const lines = raw
    .split(/[\n;]+/)
    .map((l) => l.trim())
    .filter(Boolean);
  let added = 0;
  for (const line of lines.slice(0, 2000)) {
    const [email, name] = line.split(/[,\t]/).map((s) => s?.trim());
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      await upsertSubscriber({ email, name: name || null, source: "import" });
      added += 1;
    }
  }
  revalidatePath("/admin/mail/subscribers");
  return { ok: true, info: `已导入/更新 ${added} 个地址` };
}

export async function setSubscriberStatusAction(
  id: number,
  status: "subscribed" | "unsubscribed",
): Promise<{ error?: string }> {
  await requireAdmin();
  await getDb()
    .update(mailSubscribers)
    .set({ status, updatedAt: new Date() })
    .where(eq(mailSubscribers.id, id));
  revalidatePath("/admin/mail/subscribers");
  return {};
}

export async function deleteSubscribersAction(
  ids: number[],
): Promise<{ error?: string }> {
  await requireAdmin();
  if (ids.length) {
    await getDb()
      .delete(mailSubscribers)
      .where(inArray(mailSubscribers.id, ids.slice(0, 1000)));
  }
  revalidatePath("/admin/mail/subscribers");
  return {};
}
