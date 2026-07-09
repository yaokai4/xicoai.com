import Link from "next/link";
import { requireWebmail } from "@/app/webmail/_lib";
import { listMailboxes, listEmails } from "@/lib/webmail/jmap";
import { MailList } from "./_maillist";

export const dynamic = "force-dynamic";

const PAGE = 40;

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{
    folder?: string;
    q?: string;
    p?: string;
    sent?: string;
    pwchanged?: string;
  }>;
}) {
  const { folder, q, p, sent, pwchanged } = await searchParams;
  const { cred, session } = await requireWebmail();

  const mailboxes = await listMailboxes(cred, session);
  const inbox = mailboxes.find((m) => m.role === "inbox") ?? mailboxes[0];
  const activeId = folder || inbox?.id;
  const active = mailboxes.find((m) => m.id === activeId) ?? inbox;
  const position = Math.max(0, (Number(p) || 1) - 1) * PAGE;

  const { items, total } = await listEmails(cred, session, {
    mailboxId: active?.id,
    search: q,
    limit: PAGE,
    position,
  });

  const trashId = mailboxes.find((m) => m.role === "trash")?.id ?? "";
  const page = Math.floor(position / PAGE) + 1;
  const pages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-border px-6 py-3.5">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold text-foreground">
            {folderLabel(active?.role, active?.name)}
          </h1>
          <span className="text-xs text-faint">{total} 封</span>
        </div>
        <form action="/webmail" className="flex items-center gap-2">
          <input type="hidden" name="folder" value={activeId ?? ""} />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="搜索邮件…"
            className="w-56 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground outline-none focus:border-brand"
          />
        </form>
      </header>

      {pwchanged === "1" && (
        <p className="border-b border-emerald-500/20 bg-emerald-500/10 px-6 py-2 text-sm text-emerald-600 dark:text-emerald-400">
          ✓ 密码已修改，请牢记新密码
        </p>
      )}
      {sent === "1" && (
        <p className="border-b border-emerald-500/20 bg-emerald-500/10 px-6 py-2 text-sm text-emerald-600 dark:text-emerald-400">
          ✓ 邮件已发送
        </p>
      )}
      {sent === "draft" && (
        <p className="border-b border-border bg-surface/50 px-6 py-2 text-sm text-muted">
          草稿已保存
        </p>
      )}

      <MailList
        items={items}
        folderId={activeId ?? ""}
        trashId={trashId}
        inTrash={active?.role === "trash"}
        isDrafts={active?.role === "drafts"}
      />

      {pages > 1 && (
        <footer className="flex items-center justify-center gap-4 border-t border-border px-6 py-3 text-sm">
          {page > 1 ? (
            <Link
              href={`/webmail?folder=${activeId}&p=${page - 1}${q ? `&q=${q}` : ""}`}
              className="text-muted hover:text-foreground"
            >
              ← 上一页
            </Link>
          ) : (
            <span className="text-faint">← 上一页</span>
          )}
          <span className="text-faint">
            {page} / {pages}
          </span>
          {page < pages ? (
            <Link
              href={`/webmail?folder=${activeId}&p=${page + 1}${q ? `&q=${q}` : ""}`}
              className="text-muted hover:text-foreground"
            >
              下一页 →
            </Link>
          ) : (
            <span className="text-faint">下一页 →</span>
          )}
        </footer>
      )}
    </div>
  );
}

function folderLabel(role: string | null | undefined, name: string | undefined) {
  const map: Record<string, string> = {
    inbox: "收件箱",
    sent: "已发送",
    drafts: "草稿箱",
    junk: "垃圾邮件",
    trash: "已删除",
    archive: "归档",
  };
  return (role && map[role]) || name || "邮件";
}
