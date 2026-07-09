import Link from "next/link";
import { notFound } from "next/navigation";
import { requireWebmail } from "@/app/webmail/_lib";
import { getEmail, listMailboxes, setSeen } from "@/lib/webmail/jmap";
import { MessageActions } from "./_actions";

export const dynamic = "force-dynamic";

/** Defense-in-depth sanitize; the body is additionally rendered inside a
 * sandboxed (script-less) iframe. */
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s\S]*?<\/object>/gi, "")
    .replace(/<embed[\s\S]*?>/gi, "")
    .replace(/ on[a-z]+\s*=\s*"[^"]*"/gi, "")
    .replace(/ on[a-z]+\s*=\s*'[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

function addrLine(list: { name: string | null; email: string }[]): string {
  return list.map((a) => (a.name ? `${a.name} <${a.email}>` : a.email)).join("、");
}

export default async function MessagePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ folder?: string }>;
}) {
  const { id } = await params;
  const { folder } = await searchParams;
  const { cred, session } = await requireWebmail();

  const email = await getEmail(cred, session, id);
  if (!email) notFound();

  // Mark read on open (best-effort).
  if (!email.seen) {
    try {
      await setSeen(cred, session, id, true);
    } catch {
      /* non-fatal */
    }
  }

  const mailboxes = await listMailboxes(cred, session);
  const inTrash = email.mailboxIds.includes(
    mailboxes.find((m) => m.role === "trash")?.id ?? "",
  );
  const backHref = folder ? `/webmail?folder=${folder}` : "/webmail";

  const bodyHtml = email.htmlBody
    ? sanitizeHtml(email.htmlBody)
    : `<pre style="white-space:pre-wrap;word-break:break-word;font-family:-apple-system,'PingFang SC',sans-serif;font-size:14px;line-height:1.7;color:#1d1d1f;margin:0;">${(email.textBody ?? "(无正文)")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")}</pre>`;

  const srcdoc = `<!doctype html><html><head><meta charset="utf-8"><base target="_blank"><style>body{margin:0;padding:16px;font-family:-apple-system,'PingFang SC',sans-serif;color:#1d1d1f;background:#fff;} img{max-width:100%;height:auto;} a{color:#6d5cff;}</style></head><body>${bodyHtml}</body></html>`;

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-border px-6 py-3">
        <Link href={backHref} className="text-sm text-muted hover:text-foreground">
          ← 返回
        </Link>
        <MessageActions
          id={email.id}
          inTrash={inTrash}
          replyTo={email.replyTo[0]?.email || email.from[0]?.email || ""}
          replySubject={email.subject}
          messageId={email.id}
        />
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="border-b border-border px-6 py-4">
          <h1 className="text-lg font-semibold text-foreground">
            {email.subject}
          </h1>
          <div className="mt-2 space-y-0.5 text-sm text-muted">
            <p>
              <span className="text-faint">发件人：</span>
              {addrLine(email.from)}
            </p>
            <p>
              <span className="text-faint">收件人：</span>
              {addrLine(email.to)}
            </p>
            {email.cc.length > 0 && (
              <p>
                <span className="text-faint">抄送：</span>
                {addrLine(email.cc)}
              </p>
            )}
            <p className="text-faint">
              {email.receivedAt
                ? new Date(email.receivedAt).toLocaleString("zh-CN")
                : ""}
            </p>
          </div>

          {email.attachments.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {email.attachments.map((a) => (
                <a
                  key={a.blobId}
                  href={`/webmail/attachment?blob=${encodeURIComponent(a.blobId)}&name=${encodeURIComponent(a.name)}&type=${encodeURIComponent(a.type)}`}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:text-foreground"
                >
                  📎 {a.name}（{Math.round(a.size / 1024)} KB）
                </a>
              ))}
            </div>
          )}
        </div>

        <iframe
          title="邮件内容"
          sandbox=""
          srcDoc={srcdoc}
          className="h-[calc(100vh-16rem)] w-full border-0 bg-white"
        />
      </div>
    </div>
  );
}
