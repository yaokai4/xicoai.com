"use server";

import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  jobs,
  applications,
  joinSubmissions,
  contactMessages,
  waitlistSignups,
} from "@/db/schema";
import {
  applySchema,
  joinSchema,
  contactSchema,
  waitlistSchema,
} from "@/lib/validation";
import { sendMail, notifyAddress } from "@/lib/mail";
import { pickL10n } from "@/lib/content";

export type SubmitState = { ok: boolean; error?: string };

const MAX_RESUME = 10 * 1024 * 1024; // 10MB
const RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function isBot(formData: FormData) {
  // Honeypot: real users never fill this hidden field.
  return Boolean(String(formData.get("company_website") ?? "").trim());
}

async function storeResume(
  file: File | null,
): Promise<{ resumePath?: string; resumeName?: string; error?: string }> {
  if (!file || file.size === 0) return {};
  if (file.size > MAX_RESUME) return { error: "file_too_large" };
  if (file.type && !RESUME_TYPES.includes(file.type))
    return { error: "file_type" };
  const dir = process.env.UPLOAD_DIR || "./uploads";
  await fs.mkdir(dir, { recursive: true });
  const ext = path.extname(file.name).slice(0, 12) || "";
  const safe = `${Date.now()}-${crypto.randomUUID()}${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, safe), buf);
  return { resumePath: safe, resumeName: file.name.slice(0, 200) };
}

export async function submitApplication(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  if (isBot(formData)) return { ok: true };
  const parsed = applySchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    links: formData.get("links"),
    note: formData.get("note"),
    jobSlug: formData.get("jobSlug"),
    locale: formData.get("locale"),
  });
  if (!parsed.success) return { ok: false, error: "invalid" };
  const data = parsed.data;

  const resume = await storeResume(formData.get("resume") as File | null);
  if (resume.error) return { ok: false, error: resume.error };

  try {
    const db = getDb();
    let jobId: number | null = null;
    let jobTitle: string | null = null;
    if (data.jobSlug) {
      const job = await db
        .select()
        .from(jobs)
        .where(eq(jobs.slug, data.jobSlug))
        .limit(1);
      if (job[0]) {
        jobId = job[0].id;
        jobTitle = pickL10n(job[0].title, data.locale || "zh");
      }
    }

    await db.insert(applications).values({
      jobId,
      jobTitle,
      name: data.name,
      email: data.email,
      phone: data.phone,
      links: data.links,
      note: data.note,
      resumePath: resume.resumePath,
      resumeName: resume.resumeName,
      locale: data.locale,
    });

    await notifyTeam({
      subject: `新职位投递：${data.name}${jobTitle ? ` · ${jobTitle}` : ""}`,
      lines: [
        `职位 / Role: ${jobTitle ?? "（未指定）"}`,
        `姓名 / Name: ${data.name}`,
        `邮箱 / Email: ${data.email}`,
        data.phone ? `电话 / Phone: ${data.phone}` : "",
        data.links ? `链接 / Links: ${data.links}` : "",
        resume.resumeName ? `简历 / Resume: ${resume.resumeName}` : "",
        "",
        data.note ?? "",
      ],
      replyTo: data.email,
    });
    return { ok: true };
  } catch (e) {
    console.error("submitApplication failed", e);
    return { ok: false, error: "server" };
  }
}

export async function submitJoin(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  if (isBot(formData)) return { ok: true };
  const parsed = joinSchema.safeParse({
    type: formData.get("type"),
    name: formData.get("name"),
    email: formData.get("email"),
    org: formData.get("org"),
    intro: formData.get("intro"),
    links: formData.get("links"),
    field1: formData.get("field1"),
    field2: formData.get("field2"),
    field3: formData.get("field3"),
    locale: formData.get("locale"),
  });
  if (!parsed.success) return { ok: false, error: "invalid" };
  const data = parsed.data;

  const details: Record<string, string> = {};
  if (data.field1) details.field1 = data.field1;
  if (data.field2) details.field2 = data.field2;
  if (data.field3) details.field3 = data.field3;

  try {
    const db = getDb();
    await db.insert(joinSubmissions).values({
      type: data.type,
      name: data.name,
      email: data.email,
      org: data.org,
      intro: data.intro,
      links: data.links,
      details,
      locale: data.locale,
    });

    const typeLabel = {
      investor: "投资人 Investor",
      partner: "项目合伙人 Partner",
      collaborator: "合作 Collaborator",
    }[data.type];

    await notifyTeam({
      subject: `新 /join 提交：${typeLabel} · ${data.name}`,
      lines: [
        `类型 / Type: ${typeLabel}`,
        `姓名 / Name: ${data.name}`,
        `邮箱 / Email: ${data.email}`,
        data.org ? `机构 / Org: ${data.org}` : "",
        data.field1 ? `字段1: ${data.field1}` : "",
        data.field2 ? `字段2: ${data.field2}` : "",
        data.field3 ? `字段3: ${data.field3}` : "",
        data.links ? `链接 / Links: ${data.links}` : "",
        "",
        data.intro ?? "",
      ],
      replyTo: data.email,
    });
    return { ok: true };
  } catch (e) {
    console.error("submitJoin failed", e);
    return { ok: false, error: "server" };
  }
}

export async function submitContact(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  if (isBot(formData)) return { ok: true };
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    company: formData.get("company"),
    topic: formData.get("topic"),
    message: formData.get("message"),
    locale: formData.get("locale"),
  });
  if (!parsed.success) return { ok: false, error: "invalid" };
  const data = parsed.data;

  // Fold the structured fields (timeline, budget) into the stored message
  // so the admin sees them without a schema change.
  const timeline = String(formData.get("timeline") ?? "").trim();
  const budget = String(formData.get("budget") ?? "").trim();
  const meta = [
    timeline ? `时间 / Timeline: ${timeline}` : "",
    budget ? `预算 / Budget: ${budget}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const fullMessage = meta ? `${meta}\n\n${data.message}` : data.message;

  try {
    const db = getDb();
    await db.insert(contactMessages).values({
      name: data.name,
      email: data.email,
      company: data.company,
      topic: data.topic,
      message: fullMessage,
      locale: data.locale,
    });
    await notifyTeam({
      subject: `新联系表单：${data.name}${data.topic ? ` · ${data.topic}` : ""}`,
      lines: [
        `姓名 / Name: ${data.name}`,
        `邮箱 / Email: ${data.email}`,
        data.company ? `公司 / Company: ${data.company}` : "",
        data.topic ? `类型 / Type: ${data.topic}` : "",
        "",
        fullMessage,
      ],
      replyTo: data.email,
    });
    return { ok: true };
  } catch (e) {
    console.error("submitContact failed", e);
    return { ok: false, error: "server" };
  }
}

export async function submitWaitlist(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  if (isBot(formData)) return { ok: true };
  const parsed = waitlistSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
    source: formData.get("source"),
    locale: formData.get("locale"),
  });
  if (!parsed.success) return { ok: false, error: "invalid" };
  const data = parsed.data;

  try {
    const db = getDb();
    // Idempotent: a repeat signup with the same email is a no-op success.
    const inserted = await db
      .insert(waitlistSignups)
      .values({
        email: data.email.toLowerCase(),
        name: data.name,
        source: data.source ?? "xico-clean",
        locale: data.locale,
      })
      .onConflictDoNothing({ target: waitlistSignups.email })
      .returning({ id: waitlistSignups.id });

    // Only notify on a genuinely new signup, not on duplicate submissions.
    if (inserted.length > 0) {
      await notifyTeam({
        subject: `Xico Clean 等候名单：${data.email}`,
        lines: [
          `邮箱 / Email: ${data.email}`,
          data.name ? `称呼 / Name: ${data.name}` : "",
          data.source ? `来源 / Source: ${data.source}` : "",
          data.locale ? `语言 / Locale: ${data.locale}` : "",
        ],
        replyTo: data.email,
      });
    }
    return { ok: true };
  } catch (e) {
    console.error("submitWaitlist failed", e);
    return { ok: false, error: "server" };
  }
}

async function notifyTeam({
  subject,
  lines,
  replyTo,
}: {
  subject: string;
  lines: (string | false | null | undefined)[];
  replyTo?: string;
}) {
  try {
    await sendMail({
      to: notifyAddress(),
      subject,
      text: lines.filter((l) => l !== "" && l != null).join("\n"),
      replyTo,
    });
  } catch (e) {
    console.error("notifyTeam failed (non-fatal)", e);
  }
}
