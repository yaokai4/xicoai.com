import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { waitlistSignups } from "@/db/schema";
import { setWaitlistStatus } from "@/app/admin/actions";
import { StatusSelect } from "../status-select";

export const dynamic = "force-dynamic";

const WAITLIST_STATUS = [
  { value: "new", label: "新" },
  { value: "invited", label: "已邀请" },
  { value: "converted", label: "已转化" },
  { value: "archived", label: "归档" },
];

const SOURCE_LABEL: Record<string, string> = {
  "xico-clean": "Xico Clean",
  hero: "首屏",
  cta: "尾部 CTA",
};

export default async function WaitlistAdmin() {
  const all = await getDb()
    .select()
    .from(waitlistSignups)
    .orderBy(desc(waitlistSignups.createdAt));

  const active = all.filter((s) => s.status !== "archived");
  const emails = active.map((s) => s.email).join(", ");

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        等候名单 <span className="text-faint">({all.length})</span>
      </h1>

      {emails && (
        <div className="rounded-2xl border border-border bg-surface/40 p-5">
          <div className="text-xs font-medium uppercase tracking-wider text-faint">
            全部有效邮箱（可复制）
          </div>
          <textarea
            readOnly
            value={emails}
            rows={3}
            className="mt-3 w-full resize-none rounded-xl border border-border bg-white/[0.02] px-4 py-3 text-sm text-muted outline-none"
          />
        </div>
      )}

      <div className="flex flex-col gap-3">
        {all.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-faint">
            暂无登记
          </p>
        )}
        {all.map((s) => (
          <div
            key={s.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface/40 p-5"
          >
            <div>
              <a
                href={`mailto:${s.email}`}
                className="font-medium text-foreground hover:text-accent"
              >
                {s.email}
              </a>
              {s.name && <span className="text-muted"> · {s.name}</span>}
              <div className="mt-1 flex items-center gap-2 text-xs text-faint">
                {s.source && (
                  <span className="rounded-full border border-border px-2 py-0.5">
                    {SOURCE_LABEL[s.source] ?? s.source}
                  </span>
                )}
                {s.locale && <span>{s.locale}</span>}
                <span>{s.createdAt?.toLocaleDateString("zh-CN")}</span>
              </div>
            </div>
            <StatusSelect
              action={setWaitlistStatus}
              id={s.id}
              status={s.status}
              options={WAITLIST_STATUS}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
