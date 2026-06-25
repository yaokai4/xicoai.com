import Link from "next/link";
import { asc, desc } from "drizzle-orm";
import { getDb } from "@/db";
import { jobs } from "@/db/schema";
import { pickL10n } from "@/lib/content";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  draft: "草稿",
  open: "开放",
  closed: "关闭",
};

export default async function JobsAdmin() {
  const all = await getDb()
    .select()
    .from(jobs)
    .orderBy(asc(jobs.sortOrder), desc(jobs.createdAt));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          职位
        </h1>
        <Link
          href="/admin/jobs/new"
          className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-bg transition-transform hover:scale-[1.03]"
        >
          + 新建职位
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wider text-faint">
            <tr>
              <th className="px-5 py-3 font-medium">职位</th>
              <th className="px-5 py-3 font-medium">Slug</th>
              <th className="px-5 py-3 font-medium">类型</th>
              <th className="px-5 py-3 font-medium">状态</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {all.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-faint">
                  还没有职位，点击右上角新建。
                </td>
              </tr>
            )}
            {all.map((job) => (
              <tr key={job.id} className="hover:bg-white/[0.02]">
                <td className="px-5 py-3 text-foreground">
                  {pickL10n(job.title, "zh")}
                </td>
                <td className="px-5 py-3 text-muted">{job.slug}</td>
                <td className="px-5 py-3 text-muted">{job.employmentType}</td>
                <td className="px-5 py-3">
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-xs " +
                      (job.status === "open"
                        ? "bg-accent/15 text-accent"
                        : job.status === "draft"
                          ? "bg-white/10 text-muted"
                          : "bg-white/5 text-faint")
                    }
                  >
                    {STATUS_LABEL[job.status]}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/admin/jobs/${job.id}`}
                    className="text-muted hover:text-foreground"
                  >
                    编辑
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
