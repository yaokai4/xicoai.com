import Link from "next/link";
import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { applications } from "@/db/schema";
import { setApplicationStatus } from "@/app/admin/actions";
import { StatusSelect } from "../status-select";

export const dynamic = "force-dynamic";

export const APP_STATUS = [
  { value: "new", label: "新" },
  { value: "reviewing", label: "评估中" },
  { value: "interview", label: "面试" },
  { value: "offer", label: "Offer" },
  { value: "hired", label: "录用" },
  { value: "rejected", label: "婉拒" },
  { value: "archived", label: "归档" },
];

export default async function ApplicationsAdmin() {
  const all = await getDb()
    .select()
    .from(applications)
    .orderBy(desc(applications.createdAt));

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        投递 <span className="text-faint">({all.length})</span>
      </h1>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wider text-faint">
            <tr>
              <th className="px-5 py-3 font-medium">候选人</th>
              <th className="px-5 py-3 font-medium">职位</th>
              <th className="px-5 py-3 font-medium">日期</th>
              <th className="px-5 py-3 font-medium">状态</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {all.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-faint">
                  暂无投递
                </td>
              </tr>
            )}
            {all.map((a) => (
              <tr key={a.id} className="hover:bg-white/[0.02]">
                <td className="px-5 py-3">
                  <div className="text-foreground">{a.name}</div>
                  <div className="text-xs text-faint">{a.email}</div>
                </td>
                <td className="px-5 py-3 text-muted">{a.jobTitle ?? "—"}</td>
                <td className="px-5 py-3 text-xs text-faint">
                  {a.createdAt?.toLocaleDateString("zh-CN")}
                </td>
                <td className="px-5 py-3">
                  <StatusSelect
                    action={setApplicationStatus}
                    id={a.id}
                    status={a.status}
                    options={APP_STATUS}
                  />
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/admin/applications/${a.id}`}
                    className="text-muted hover:text-foreground"
                  >
                    查看
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
