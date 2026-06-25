import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { joinSubmissions } from "@/db/schema";
import { setJoinStatus } from "@/app/admin/actions";
import { StatusSelect } from "../status-select";

export const dynamic = "force-dynamic";

const JOIN_STATUS = [
  { value: "new", label: "新" },
  { value: "reviewing", label: "跟进中" },
  { value: "contacted", label: "已联系" },
  { value: "archived", label: "归档" },
];

const TYPE_LABEL: Record<string, string> = {
  investor: "投资人",
  partner: "项目合伙人",
  collaborator: "合作",
};

export default async function JoinAdmin() {
  const all = await getDb()
    .select()
    .from(joinSubmissions)
    .orderBy(desc(joinSubmissions.createdAt));

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Join 提交 <span className="text-faint">({all.length})</span>
      </h1>

      <div className="flex flex-col gap-3">
        {all.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-faint">
            暂无提交
          </p>
        )}
        {all.map((j) => {
          const details = (j.details ?? {}) as Record<string, string>;
          const detailVals = [details.field1, details.field2, details.field3]
            .filter(Boolean)
            .join(" · ");
          return (
            <div
              key={j.id}
              className="rounded-2xl border border-border bg-surface/40 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-brand/15 px-2 py-0.5 text-xs text-brand-soft">
                      {TYPE_LABEL[j.type] ?? j.type}
                    </span>
                    <span className="font-medium text-foreground">{j.name}</span>
                  </div>
                  <a
                    href={`mailto:${j.email}`}
                    className="text-xs text-faint hover:text-accent"
                  >
                    {j.email}
                    {j.org ? ` · ${j.org}` : ""}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-faint">
                    {j.createdAt?.toLocaleDateString("zh-CN")}
                  </span>
                  <StatusSelect
                    action={setJoinStatus}
                    id={j.id}
                    status={j.status}
                    options={JOIN_STATUS}
                  />
                </div>
              </div>
              {detailVals && (
                <p className="mt-3 text-sm text-muted">{detailVals}</p>
              )}
              {j.links && (
                <p className="mt-1 text-xs text-faint">{j.links}</p>
              )}
              {j.intro && (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted/90">
                  {j.intro}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
