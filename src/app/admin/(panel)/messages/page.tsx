import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { contactMessages } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function MessagesAdmin() {
  const all = await getDb()
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt));

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        联系表单 <span className="text-faint">({all.length})</span>
      </h1>

      <div className="flex flex-col gap-3">
        {all.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-faint">
            暂无消息
          </p>
        )}
        {all.map((m) => (
          <div
            key={m.id}
            className="rounded-2xl border border-border bg-surface/40 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="font-medium text-foreground">{m.name}</span>
                {m.company && (
                  <span className="text-muted"> · {m.company}</span>
                )}
                <a
                  href={`mailto:${m.email}`}
                  className="ml-2 text-xs text-faint hover:text-accent"
                >
                  {m.email}
                </a>
              </div>
              <div className="flex items-center gap-3 text-xs text-faint">
                {m.topic && (
                  <span className="rounded-full border border-border px-2 py-0.5">
                    {m.topic}
                  </span>
                )}
                <span>{m.createdAt?.toLocaleDateString("zh-CN")}</span>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted/90">
              {m.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
