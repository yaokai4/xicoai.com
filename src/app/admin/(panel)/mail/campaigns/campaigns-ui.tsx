"use client";

import { useState } from "react";
import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createCampaignAction,
  sendCampaignAction,
  testCampaignAction,
  type MailActionState,
} from "@/app/admin/mail-actions";

const field =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand";

export function CampaignForm({
  audienceCounts,
}: {
  audienceCounts: { subscribed: number; purchasers: number; waitlist: number };
}) {
  const [state, action, pending] = useActionState<MailActionState, FormData>(
    createCampaignAction,
    {},
  );
  return (
    <section className="rounded-2xl border border-border p-6">
      <h2 className="text-base font-semibold text-foreground">新建活动</h2>
      <form action={action} className="mt-4 flex max-w-2xl flex-col gap-3">
        <input name="subject" placeholder="邮件主题" className={field} />
        <input
          name="preheader"
          placeholder="预览文字（选填，在收件箱主题旁显示）"
          className={field}
        />
        <textarea
          name="body"
          rows={8}
          placeholder={"正文（纯文本，空行分段，链接自动可点）\n\n退订链接自动附加，无需手写。"}
          className={field}
        />
        <label className="flex items-center gap-3 text-sm text-muted">
          受众
          <select name="audience" className={`${field} max-w-[16rem]`}>
            <option value="subscribed">
              全部订阅者（{audienceCounts.subscribed}）
            </option>
            <option value="purchasers">
              已购买用户（{audienceCounts.purchasers}）
            </option>
            <option value="waitlist">
              等候名单（{audienceCounts.waitlist}）
            </option>
          </select>
        </label>
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={pending}
            className="self-start rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-bg transition-opacity disabled:opacity-50"
          >
            {pending ? "保存中…" : "保存为草稿"}
          </button>
          {state.ok && <span className="text-sm text-emerald-400">已保存</span>}
          {state.error && <span className="text-sm text-red-400">{state.error}</span>}
        </div>
      </form>
    </section>
  );
}

export function CampaignRowTools({ id, draft }: { id: number; draft: boolean }) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  function run(fn: () => Promise<MailActionState>) {
    startTransition(async () => {
      const res = await fn();
      setMsg(res.info ?? res.error ?? null);
      router.refresh();
    });
  }

  return (
    <span className="inline-flex items-center gap-3 text-xs">
      {msg && <span className="text-faint">{msg}</span>}
      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => testCampaignAction(id))}
        className="text-muted transition-colors hover:text-foreground"
      >
        发我测试
      </button>
      {draft && (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (confirm("确认正式群发？该操作会把邮件写入发送队列，不可撤销。")) {
              run(() => sendCampaignAction(id));
            }
          }}
          className="font-medium text-brand transition-opacity hover:opacity-80"
        >
          正式群发
        </button>
      )}
    </span>
  );
}
