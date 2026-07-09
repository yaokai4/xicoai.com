import { redirect } from "next/navigation";
import { requireWebmail } from "@/app/webmail/_lib";
import { isMailAdmin } from "@/lib/webmail/session";
import { listMailUsers, mailDomain, stalwartConfigured } from "@/lib/stalwart";
import { AdminPanel, type UserRow } from "./_panel";

export const dynamic = "force-dynamic";

export default async function WebmailAdminPage() {
  const { cred } = await requireWebmail();
  if (!isMailAdmin(cred.email)) redirect("/webmail");

  const domain = mailDomain();
  let users: UserRow[] = [];
  let error: string | null = null;
  if (stalwartConfigured()) {
    try {
      const list = await listMailUsers();
      users = list.map((u) => ({
        id: u.id,
        email: u.email,
        displayName: u.displayName,
        aliases: u.aliases,
      }));
    } catch (e) {
      console.error("webmail admin listMailUsers failed", e);
      error = "邮件后端暂时不可达";
    }
  } else {
    error = "服务器未配置 STALWART_ADMIN_SECRET";
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <header className="border-b border-border px-6 py-3.5">
        <h1 className="text-base font-semibold text-foreground">用户管理</h1>
        <p className="mt-1 text-xs text-muted">
          管理 @{domain} 企业邮箱账号：创建、改密、别名、删除。
        </p>
      </header>
      <div className="p-6">
        {error ? (
          <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-500">
            {error}
          </p>
        ) : (
          <AdminPanel users={users} domain={domain} />
        )}
      </div>
    </div>
  );
}
