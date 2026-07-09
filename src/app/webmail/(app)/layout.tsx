import Link from "next/link";
import { redirect } from "next/navigation";
import { requireWebmail } from "@/app/webmail/_lib";
import { listMailboxes, type Mailbox } from "@/lib/webmail/jmap";
import { isMailAdmin } from "@/lib/webmail/session";
import { mustChangePassword } from "@/lib/webmail/password-policy";
import { logoutAction } from "@/app/webmail/_actions";
import { FolderNav } from "./_shell";

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = {
  inbox: "收件箱",
  sent: "已发送",
  drafts: "草稿箱",
  junk: "垃圾邮件",
  trash: "已删除",
  archive: "归档",
};
const ROLE_ORDER = ["inbox", "drafts", "sent", "junk", "trash", "archive"];

function sortFolders(mailboxes: Mailbox[]): Mailbox[] {
  return [...mailboxes].sort((a, b) => {
    const ia = a.role ? ROLE_ORDER.indexOf(a.role) : 99;
    const ib = b.role ? ROLE_ORDER.indexOf(b.role) : 99;
    if (ia !== ib) return (ia < 0 ? 98 : ia) - (ib < 0 ? 98 : ib);
    return a.name.localeCompare(b.name);
  });
}

export default async function WebmailShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { cred, session } = await requireWebmail();
  // Force first-login / post-reset users to set their own password before they
  // can use the mailbox. The change-password page is outside this (app) group,
  // so it stays reachable and this never loops.
  if (await mustChangePassword(cred.email)) {
    redirect("/webmail/change-password");
  }
  const mailboxes = sortFolders(await listMailboxes(cred, session));
  const admin = isMailAdmin(cred.email);

  const folders = mailboxes.map((m) => ({
    id: m.id,
    label: m.role ? ROLE_LABEL[m.role] ?? m.name : m.name,
    role: m.role,
    unread: m.unreadEmails,
    total: m.totalEmails,
  }));
  const inboxId = mailboxes.find((m) => m.role === "inbox")?.id ?? mailboxes[0]?.id;

  return (
    <div className="flex h-screen">
      <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-bg-soft">
        <div className="flex items-center gap-2 px-5 pb-4 pt-5">
          <Link href="/webmail" className="text-base font-semibold tracking-tight">
            智希可邮箱
          </Link>
        </div>

        <div className="px-3">
          <Link
            href="/webmail/compose"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            ✏️ 写邮件
          </Link>
        </div>

        <FolderNav folders={folders} inboxId={inboxId} />

        <div className="mt-2 flex flex-col gap-0.5 border-t border-border px-3 py-3">
          <Link
            href="/webmail/contacts"
            className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-white/5 hover:text-foreground"
          >
            通讯录
          </Link>
          <Link
            href="/webmail/change-password"
            className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-white/5 hover:text-foreground"
          >
            修改密码
          </Link>
          {admin && (
            <Link
              href="/webmail/admin"
              className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-white/5 hover:text-foreground"
            >
              用户管理
            </Link>
          )}
        </div>

        <div className="mt-auto border-t border-border px-4 py-3">
          <p className="truncate text-xs text-muted" title={cred.email}>
            {cred.email}
          </p>
          <form action={logoutAction}>
            <button
              type="submit"
              className="mt-1 text-xs text-faint transition-colors hover:text-foreground"
            >
              退出登录
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
