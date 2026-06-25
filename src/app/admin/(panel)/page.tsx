import Link from "next/link";
import { desc, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  jobs,
  applications,
  joinSubmissions,
  contactMessages,
} from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const db = getDb();
  const c = (n: { count: number }[]) => n[0]?.count ?? 0;

  const [jobsN, appsN, joinN, msgN, recentApps, recentJoin] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(jobs),
    db.select({ count: sql<number>`count(*)::int` }).from(applications),
    db.select({ count: sql<number>`count(*)::int` }).from(joinSubmissions),
    db.select({ count: sql<number>`count(*)::int` }).from(contactMessages),
    db.select().from(applications).orderBy(desc(applications.createdAt)).limit(6),
    db
      .select()
      .from(joinSubmissions)
      .orderBy(desc(joinSubmissions.createdAt))
      .limit(6),
  ]);

  const stats = [
    { label: "职位", value: c(jobsN), href: "/admin/jobs" },
    { label: "投递", value: c(appsN), href: "/admin/applications" },
    { label: "Join 提交", value: c(joinN), href: "/admin/join" },
    { label: "联系表单", value: c(msgN), href: "/admin/messages" },
  ];

  return (
    <div className="flex flex-col gap-10">
      <h1 className="font-display text-2xl font-semibold tracking-tight">概览</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-2xl border border-border bg-surface/40 p-5 transition-colors hover:border-border-strong"
          >
            <div className="text-3xl font-semibold text-foreground">
              {s.value}
            </div>
            <div className="mt-1 text-sm text-muted">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface/40 p-6">
          <h2 className="text-sm font-medium text-muted">最近投递</h2>
          <ul className="mt-4 flex flex-col divide-y divide-border">
            {recentApps.length === 0 && (
              <li className="py-3 text-sm text-faint">暂无</li>
            )}
            {recentApps.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-3">
                <Link
                  href={`/admin/applications/${a.id}`}
                  className="text-sm text-foreground hover:text-accent"
                >
                  {a.name}
                  {a.jobTitle ? ` · ${a.jobTitle}` : ""}
                </Link>
                <span className="text-xs text-faint">
                  {a.createdAt?.toLocaleDateString("zh-CN")}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-surface/40 p-6">
          <h2 className="text-sm font-medium text-muted">最近 Join</h2>
          <ul className="mt-4 flex flex-col divide-y divide-border">
            {recentJoin.length === 0 && (
              <li className="py-3 text-sm text-faint">暂无</li>
            )}
            {recentJoin.map((j) => (
              <li key={j.id} className="flex items-center justify-between py-3">
                <Link
                  href="/admin/join"
                  className="text-sm text-foreground hover:text-accent"
                >
                  {j.name} · {j.type}
                </Link>
                <span className="text-xs text-faint">
                  {j.createdAt?.toLocaleDateString("zh-CN")}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
