import { listMailUsers, mailDomain, stalwartConfigured } from "@/lib/stalwart";
import { CreateUserForm, MailUserTable, type MailUserRow } from "./users-ui";

export const dynamic = "force-dynamic";

export default async function MailUsersAdminPage() {
  const domain = mailDomain();
  const configured = stalwartConfigured();

  let users: MailUserRow[] = [];
  let backendError: string | null = null;
  if (configured) {
    try {
      const list = await listMailUsers();
      users = list.map((u) => ({
        id: u.id,
        email: u.email,
        displayName: u.displayName,
        aliases: u.aliases,
        usedQuota: u.usedDiskQuota,
      }));
    } catch (e) {
      console.error("listMailUsers failed", e);
      backendError = "邮件后端暂时不可达（Stalwart 容器未运行或密钥未配置）。";
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          邮箱账号
        </h1>
        <p className="mt-2 text-sm text-muted">
          企业邮箱用户管理：在这里创建的 <code>xxx@{domain}</code> 是真实邮箱，
          可添加到 QQ 邮箱、Gmail、Apple 邮件、Outlook 等任意客户端使用
          （IMAP 收信 + SMTP 发信）。账号数量没有限制。
        </p>
        <div className="mt-4 rounded-xl border border-border bg-surface/50 p-4 text-xs leading-relaxed text-muted">
          <p className="font-medium text-foreground">客户端配置参数（发给员工）：</p>
          <p className="mt-1">
            收件 IMAP：<code>mail.{domain}</code> · 端口 <code>993</code> · SSL/TLS
            <span className="mx-2 text-faint">|</span>
            发件 SMTP：<code>mail.{domain}</code> · 端口 <code>465</code>（SSL）或 <code>587</code>（STARTTLS）
          </p>
          <p className="mt-1">用户名 = 完整邮箱地址，密码 = 创建时生成的密码。</p>
        </div>
      </div>

      {!configured ? (
        <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-500">
          服务器 .env 缺少 <code>STALWART_ADMIN_SECRET</code>，请先完成邮件后端部署。
        </p>
      ) : (
        <>
          <CreateUserForm domain={domain} />
          {backendError ? (
            <p className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-400">
              {backendError}
            </p>
          ) : (
            <MailUserTable users={users} domain={domain} />
          )}
        </>
      )}
    </div>
  );
}
