import { desc, eq, count, and } from "drizzle-orm";
import { getDb } from "@/db";
import { mailCampaigns, mailOutbox, mailSubscribers } from "@/db/schema";
import { CampaignForm, CampaignRowTools } from "./campaigns-ui";

export const dynamic = "force-dynamic";

const AUDIENCE_LABEL: Record<string, string> = {
  subscribed: "全部订阅者",
  purchasers: "已购买用户",
  waitlist: "等候名单",
};

export default async function CampaignsAdminPage() {
  const db = getDb();

  const campaigns = await db
    .select()
    .from(mailCampaigns)
    .orderBy(desc(mailCampaigns.id))
    .limit(100);

  // Audience sizes for the form hint.
  const [all, buyers, waitlist] = await Promise.all([
    db.select({ n: count() }).from(mailSubscribers).where(eq(mailSubscribers.status, "subscribed")),
    db.select({ n: count() }).from(mailSubscribers).where(and(eq(mailSubscribers.status, "subscribed"), eq(mailSubscribers.source, "order"))),
    db.select({ n: count() }).from(mailSubscribers).where(and(eq(mailSubscribers.status, "subscribed"), eq(mailSubscribers.source, "waitlist"))),
  ]);

  // Sent counts per campaign.
  const sentRows = await db
    .select({ campaignId: mailOutbox.campaignId, status: mailOutbox.status, n: count() })
    .from(mailOutbox)
    .groupBy(mailOutbox.campaignId, mailOutbox.status);
  const sentBy: Record<number, { sent: number; failed: number }> = {};
  for (const r of sentRows) {
    if (r.campaignId == null) continue;
    const s = (sentBy[r.campaignId] ??= { sent: 0, failed: 0 });
    if (r.status === "sent") s.sent += r.n;
    if (r.status === "failed") s.failed += r.n;
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          营销邮件
        </h1>
        <p className="mt-2 text-sm text-muted">
          面向订阅者的群发。每封邮件自动带品牌模板和该收件人的一键退订链接（符合反垃圾邮件规范）；
          发送经队列限速（默认 30 封/分钟）。建议先「发我测试」确认排版再正式群发。
        </p>
      </div>

      <CampaignForm
        audienceCounts={{
          subscribed: all[0]?.n ?? 0,
          purchasers: buyers[0]?.n ?? 0,
          waitlist: waitlist[0]?.n ?? 0,
        }}
      />

      <section>
        <h2 className="text-base font-semibold text-foreground">
          历史活动（{campaigns.length}）
        </h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-4 py-3 font-medium">主题</th>
                <th className="px-4 py-3 font-medium">受众</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">已发/入队</th>
                <th className="px-4 py-3 font-medium">创建时间</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => {
                const stats = sentBy[c.id] ?? { sent: 0, failed: 0 };
                return (
                  <tr key={c.id} className="border-b border-border/50">
                    <td className="max-w-[280px] truncate px-4 py-2.5 text-foreground">
                      {c.subject}
                    </td>
                    <td className="px-4 py-2.5 text-muted">
                      {AUDIENCE_LABEL[c.audience] ?? c.audience}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={
                          c.status === "draft" ? "text-amber-400" : "text-emerald-400"
                        }
                      >
                        {c.status === "draft" ? "草稿" : "已群发"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-muted">
                      {c.status === "draft"
                        ? "—"
                        : `${stats.sent}/${c.totalQueued}${stats.failed ? ` (失败 ${stats.failed})` : ""}`}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-xs text-faint">
                      {c.createdAt.toISOString().slice(0, 10)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right">
                      <CampaignRowTools id={c.id} draft={c.status === "draft"} />
                    </td>
                  </tr>
                );
              })}
              {!campaigns.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-faint">
                    还没有活动
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
