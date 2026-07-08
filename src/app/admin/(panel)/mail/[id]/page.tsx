import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { mailMessages } from "@/db/schema";
import { ReplyForm, MessageTools } from "../mail-ui";

export const dynamic = "force-dynamic";

/** Very small tag-stripper so html-only mail is readable without XSS risk —
 * we never render foreign HTML in the admin. */
function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default async function MailDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isInteger(id)) notFound();

  const db = getDb();
  const rows = await db
    .select()
    .from(mailMessages)
    .where(eq(mailMessages.id, id))
    .limit(1);
  const m = rows[0];
  if (!m) notFound();

  if (m.direction === "in" && m.unread) {
    await db
      .update(mailMessages)
      .set({ unread: false })
      .where(eq(mailMessages.id, id));
  }

  const body = m.text?.trim() || (m.html ? stripHtml(m.html) : "(空正文)");

  return (
    <div className="max-w-3xl">
      <Link href="/admin/mail" className="text-sm text-muted hover:text-foreground">
        ← 返回邮件
      </Link>

      <div className="mt-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-semibold text-foreground">
            {m.subject || "(无主题)"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {m.direction === "in" ? (
              <>
                {m.fromName ? `${m.fromName} ` : ""}
                &lt;{m.fromEmail}&gt; → {m.rcpt?.join(", ") ?? m.toEmail}
              </>
            ) : (
              <>发给 {m.toEmail}</>
            )}
            <span className="ml-3 text-faint">
              {m.createdAt.toISOString().slice(0, 16).replace("T", " ")}
            </span>
          </p>
        </div>
        {m.direction === "in" && (
          <MessageTools id={m.id} archived={m.archived} />
        )}
      </div>

      <div className="mt-6 whitespace-pre-wrap rounded-2xl border border-border bg-surface/50 p-6 text-[15px] leading-7 text-foreground/90">
        {body}
      </div>

      {(m.attachments?.length ?? 0) > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {m.attachments!.map((a) => (
            <a
              key={a.path}
              href={`/api/admin/mail-attachment?path=${encodeURIComponent(a.path)}`}
              className="rounded-full border border-border px-3.5 py-1.5 text-xs text-muted transition-colors hover:text-foreground"
            >
              📎 {a.filename}（{Math.round(a.size / 1024)} KB）
            </a>
          ))}
        </div>
      )}

      {m.direction === "in" && m.fromEmail && <ReplyForm messageId={m.id} />}
    </div>
  );
}
