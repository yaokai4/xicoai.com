"use client";

import { useState } from "react";
import { useActionState } from "react";
import { sendAction, type SendState } from "@/app/webmail/_actions";

const field =
  "w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand";

export function ComposeForm({
  from,
  defaultTo,
  defaultCc,
  defaultSubject,
  inReplyTo,
}: {
  from: string;
  defaultTo: string;
  defaultCc: string;
  defaultSubject: string;
  inReplyTo: string;
}) {
  const [state, action, pending] = useActionState<SendState, FormData>(
    sendAction,
    {},
  );
  const [showCc, setShowCc] = useState(Boolean(defaultCc));

  return (
    <form action={action} className="flex min-h-0 flex-1 flex-col">
      <input type="hidden" name="inReplyTo" value={inReplyTo} />
      <div className="flex flex-col gap-3 px-6 py-4">
        <div className="flex items-center gap-3 text-sm">
          <span className="w-14 shrink-0 text-faint">发件人</span>
          <span className="text-muted">{from}</span>
        </div>
        <label className="flex items-center gap-3">
          <span className="w-14 shrink-0 text-sm text-faint">收件人</span>
          <input
            name="to"
            defaultValue={defaultTo}
            placeholder="多个地址用逗号分隔"
            className={field}
            autoFocus={!defaultTo}
          />
          {!showCc && (
            <button
              type="button"
              onClick={() => setShowCc(true)}
              className="shrink-0 text-xs text-muted hover:text-foreground"
            >
              抄送
            </button>
          )}
        </label>
        {showCc && (
          <label className="flex items-center gap-3">
            <span className="w-14 shrink-0 text-sm text-faint">抄送</span>
            <input name="cc" defaultValue={defaultCc} className={field} />
          </label>
        )}
        <label className="flex items-center gap-3">
          <span className="w-14 shrink-0 text-sm text-faint">主题</span>
          <input
            name="subject"
            defaultValue={defaultSubject}
            placeholder="邮件主题"
            className={field}
          />
        </label>
      </div>

      <div className="min-h-0 flex-1 px-6">
        <textarea
          name="body"
          placeholder="在此输入邮件正文…"
          className="h-full w-full resize-none rounded-lg border border-border bg-surface px-3.5 py-3 text-sm leading-6 text-foreground outline-none focus:border-brand"
        />
      </div>

      <div className="flex items-center gap-3 border-t border-border px-6 py-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand px-5 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-50"
        >
          {pending ? "发送中…" : "发送"}
        </button>
        <button
          type="submit"
          name="draft"
          value="1"
          disabled={pending}
          className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition-colors hover:text-foreground disabled:opacity-50"
        >
          存草稿
        </button>
        {state.error && <span className="text-sm text-red-500">{state.error}</span>}
      </div>
    </form>
  );
}
