import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { applications } from "@/db/schema";
import { setApplicationStatus } from "@/app/admin/actions";
import { StatusSelect } from "../../status-select";
import { APP_STATUS } from "../page";

export const dynamic = "force-dynamic";

export default async function ApplicationDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rows = await getDb()
    .select()
    .from(applications)
    .where(eq(applications.id, Number(id)))
    .limit(1);
  const a = rows[0];
  if (!a) notFound();

  const rows2: [string, React.ReactNode][] = [
    ["邮箱", <a key="e" href={`mailto:${a.email}`} className="text-accent">{a.email}</a>],
    ["电话", a.phone || "—"],
    ["职位", a.jobTitle || "—"],
    ["链接", a.links || "—"],
    ["语言", a.locale || "—"],
    ["时间", a.createdAt?.toLocaleString("zh-CN") || "—"],
  ];

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <div>
        <Link
          href="/admin/applications"
          className="text-sm text-muted hover:text-foreground"
        >
          ← 返回投递列表
        </Link>
        <div className="mt-3 flex items-center justify-between gap-4">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {a.name}
          </h1>
          <StatusSelect
            action={setApplicationStatus}
            id={a.id}
            status={a.status}
            options={APP_STATUS}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface/40 p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          {rows2.map(([k, v]) => (
            <div key={k} className="flex flex-col gap-1">
              <dt className="text-xs uppercase tracking-wider text-faint">{k}</dt>
              <dd className="text-sm text-foreground">{v}</dd>
            </div>
          ))}
        </dl>
        {a.resumePath && (
          <a
            href={`/admin/applications/${a.id}/resume`}
            className="mt-6 inline-flex rounded-full border border-border px-4 py-2 text-sm text-foreground transition-colors hover:border-border-strong"
          >
            下载简历{a.resumeName ? ` · ${a.resumeName}` : ""}
          </a>
        )}
      </div>

      {a.note && (
        <div className="rounded-2xl border border-border bg-surface/40 p-6">
          <h2 className="text-xs uppercase tracking-wider text-faint">附言</h2>
          <p className="mt-3 whitespace-pre-wrap leading-relaxed text-muted/90">
            {a.note}
          </p>
        </div>
      )}
    </div>
  );
}
