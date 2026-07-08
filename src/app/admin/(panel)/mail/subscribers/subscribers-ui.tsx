"use client";

import { useState } from "react";
import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  importSubscribersAction,
  setSubscriberStatusAction,
  deleteSubscribersAction,
  type MailActionState,
} from "@/app/admin/mail-actions";

const field =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand";

export type SubscriberRow = {
  id: number;
  email: string;
  name: string | null;
  locale: string | null;
  source: string;
  status: string;
  createdAt: string;
};

export function ImportForm() {
  const [state, action, pending] = useActionState<MailActionState, FormData>(
    importSubscribersAction,
    {},
  );
  return (
    <section className="rounded-2xl border border-border p-6">
      <h2 className="text-base font-semibold text-foreground">导入地址</h2>
      <form action={action} className="mt-4 flex max-w-2xl flex-col gap-3">
        <textarea
          name="list"
          rows={4}
          placeholder={"每行一个：email 或 email,姓名\nalice@example.com,Alice\nbob@example.com"}
          className={field}
        />
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={pending}
            className="self-start rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-bg transition-opacity disabled:opacity-50"
          >
            {pending ? "导入中…" : "导入"}
          </button>
          {state.info && <span className="text-sm text-emerald-400">{state.info}</span>}
          {state.error && <span className="text-sm text-red-400">{state.error}</span>}
        </div>
      </form>
    </section>
  );
}

const SOURCE_LABEL: Record<string, string> = {
  order: "购买",
  waitlist: "等候名单",
  manual: "手动",
  import: "导入",
};

export function SubscriberTable({
  subscribers,
}: {
  subscribers: SubscriberRow[];
}) {
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const q = query.trim().toLowerCase();
  const filtered = q
    ? subscribers.filter(
        (s) =>
          s.email.includes(q) || (s.name ?? "").toLowerCase().includes(q),
      )
    : subscribers;

  function toggle(s: SubscriberRow) {
    startTransition(async () => {
      await setSubscriberStatusAction(
        s.id,
        s.status === "subscribed" ? "unsubscribed" : "subscribed",
      );
      router.refresh();
    });
  }

  function remove(id: number) {
    startTransition(async () => {
      await deleteSubscribersAction([id]);
      router.refresh();
    });
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">
          名录（{subscribers.length}）
        </h2>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索邮箱/姓名"
          className={`${field} max-w-[16rem]`}
        />
      </div>
      <div className="mt-4 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted">
              <th className="px-4 py-3 font-medium">邮箱</th>
              <th className="px-4 py-3 font-medium">姓名</th>
              <th className="px-4 py-3 font-medium">语言</th>
              <th className="px-4 py-3 font-medium">来源</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium">加入时间</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-border/50">
                <td className="px-4 py-2.5 text-foreground">{s.email}</td>
                <td className="px-4 py-2.5 text-muted">{s.name ?? "—"}</td>
                <td className="px-4 py-2.5 text-muted">{s.locale ?? "—"}</td>
                <td className="px-4 py-2.5 text-muted">
                  {SOURCE_LABEL[s.source] ?? s.source}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={
                      s.status === "subscribed"
                        ? "text-emerald-400"
                        : "text-faint"
                    }
                  >
                    {s.status === "subscribed" ? "已订阅" : "已退订"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-xs text-faint">
                  {s.createdAt.slice(0, 10)}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right text-xs">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => toggle(s)}
                    className="mr-3 text-muted transition-colors hover:text-foreground"
                  >
                    {s.status === "subscribed" ? "退订" : "恢复订阅"}
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => remove(s.id)}
                    className="text-red-400/70 transition-colors hover:text-red-400"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-faint">
                  暂无订阅者
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
