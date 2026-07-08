import Link from "next/link";
import { desc, eq, and, count } from "drizzle-orm";
import { getDb } from "@/db";
import { mailMessages, mailOutbox } from "@/db/schema";
import { ComposeForm } from "./mail-ui";

export const dynamic = "force-dynamic";

const BOXES = [
  { id: "inbox", label: "收件箱" },
  { id: "sent", label: "已发送" },
  { id: "queue", label: "发送队列" },
  { id: "archived", label: "已归档" },
] as const;

export default async function MailAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ box?: string }>;
}) {
  const { box: boxRaw } = await searchParams;
  const box = BOXES.some((b) => b.id === boxRaw) ? boxRaw! : "inbox";
  const db = getDb();

  const unreadRow = await db
    .select({ n: count() })
    .from(mailMessages)
    .where(
      and(
        eq(mailMessages.direction, "in"),
        eq(mailMessages.unread, true),
        eq(mailMessages.archived, false),
      ),
    );
  const unread = unreadRow[0]?.n ?? 0;

  const queueRows =
    box === "queue"
      ? await db
          .select()
          .from(mailOutbox)
          .orderBy(desc(mailOutbox.id))
          .limit(200)
      : [];

  const messages =
    box === "queue"
      ? []
      : await db
          .select()
          .from(mailMessages)
          .where(
            box === "archived"
              ? and(eq(mailMessages.direction, "in"), eq(mailMessages.archived, true))
              : box === "sent"
                ? eq(mailMessages.direction, "out")
                : and(
                    eq(mailMessages.direction, "in"),
                    eq(mailMessages.archived, false),
                  ),
          )
          .orderBy(desc(mailMessages.id))
          .limit(200);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          邮件
        </h1>
        <p className="mt-2 text-sm text-muted">
          自建邮件系统：收件箱接收发到 @xicoai.com 域名下任意地址的邮件（无账号数量限制）；
          所有外发（激活码、回复、营销）都经由发送队列按限速投递。
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {BOXES.map((b) => (
          <Link
            key={b.id}
            href={`/admin/mail?box=${b.id}`}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              box === b.id
                ? "border-brand/50 bg-brand/10 text-brand"
                : "border-border text-muted hover:text-foreground"
            }`}
          >
            {b.label}
            {b.id === "inbox" && unread > 0 && (
              <span className="ml-1.5 rounded-full bg-brand px-1.5 text-[11px] font-semibold text-white">
                {unread}
              </span>
            )}
          </Link>
        ))}
      </div>

      {box === "queue" ? (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-4 py-3 font-medium">收件人</th>
                <th className="px-4 py-3 font-medium">主题</th>
                <th className="px-4 py-3 font-medium">类型</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">尝试</th>
                <th className="px-4 py-3 font-medium">错误</th>
              </tr>
            </thead>
            <tbody>
              {queueRows.map((r) => (
                <tr key={r.id} className="border-b border-border/50">
                  <td className="px-4 py-2.5 text-foreground">{r.toEmail}</td>
                  <td className="max-w-[260px] truncate px-4 py-2.5 text-muted">
                    {r.subject}
                  </td>
                  <td className="px-4 py-2.5 text-muted">{r.kind}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={
                        r.status === "sent"
                          ? "text-emerald-400"
                          : r.status === "failed"
                            ? "text-red-400"
                            : "text-amber-400"
                      }
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-muted">{r.attempts}</td>
                  <td className="max-w-[220px] truncate px-4 py-2.5 text-xs text-faint">
                    {r.lastError ?? "—"}
                  </td>
                </tr>
              ))}
              {!queueRows.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-faint">
                    队列为空
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          {messages.map((m) => (
            <Link
              key={m.id}
              href={`/admin/mail/${m.id}`}
              className={`flex items-center gap-4 border-b border-border/50 px-5 py-3.5 transition-colors last:border-0 hover:bg-white/[0.03] ${
                m.direction === "in" && m.unread ? "bg-brand/[0.04]" : ""
              }`}
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  m.direction === "in" && m.unread ? "bg-brand" : "bg-transparent"
                }`}
              />
              <span className="w-52 shrink-0 truncate text-sm text-foreground">
                {m.direction === "in"
                  ? m.fromName || m.fromEmail || "(未知发件人)"
                  : `→ ${m.toEmail}`}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-muted">
                {m.subject || "(无主题)"}
              </span>
              {(m.attachments?.length ?? 0) > 0 && (
                <span className="text-xs text-faint">📎</span>
              )}
              <span className="shrink-0 text-xs text-faint">
                {m.createdAt.toISOString().slice(0, 16).replace("T", " ")}
              </span>
            </Link>
          ))}
          {!messages.length && (
            <p className="px-5 py-12 text-center text-sm text-faint">
              {box === "inbox"
                ? "还没有收到邮件。等 DNS 的 MX 记录切换 + Lightsail 防火墙放行 25 端口后，发往 @xicoai.com 的邮件就会出现在这里。"
                : "暂无邮件"}
            </p>
          )}
        </div>
      )}

      <ComposeForm />
    </div>
  );
}
