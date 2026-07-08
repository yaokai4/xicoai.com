"use client";

import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  composeMailAction,
  replyMailAction,
  setMessageFlagsAction,
  type MailActionState,
} from "@/app/admin/mail-actions";

const field =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand";

export function ComposeForm() {
  const [state, action, pending] = useActionState<MailActionState, FormData>(
    composeMailAction,
    {},
  );
  return (
    <section className="rounded-2xl border border-border p-6">
      <h2 className="text-base font-semibold text-foreground">写邮件</h2>
      <form action={action} className="mt-4 flex max-w-2xl flex-col gap-3">
        <input name="to" type="email" placeholder="收件人 someone@example.com" className={field} />
        <input name="subject" placeholder="主题" className={field} />
        <textarea name="body" rows={6} placeholder="正文（纯文本，空行分段，链接自动可点）" className={field} />
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-bg transition-opacity disabled:opacity-50"
          >
            {pending ? "入队中…" : "发送"}
          </button>
          {state.info && <span className="text-sm text-emerald-400">{state.info}</span>}
          {state.error && <span className="text-sm text-red-400">{state.error}</span>}
        </div>
      </form>
    </section>
  );
}

export function ReplyForm({ messageId }: { messageId: number }) {
  const [state, action, pending] = useActionState<MailActionState, FormData>(
    replyMailAction,
    {},
  );
  return (
    <form action={action} className="mt-6 flex flex-col gap-3">
      <input type="hidden" name="messageId" value={messageId} />
      <textarea
        name="body"
        rows={5}
        placeholder="输入回复内容…"
        className={field}
      />
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="self-start rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-bg transition-opacity disabled:opacity-50"
        >
          {pending ? "入队中…" : "回复"}
        </button>
        {state.info && <span className="text-sm text-emerald-400">{state.info}</span>}
        {state.error && <span className="text-sm text-red-400">{state.error}</span>}
      </div>
    </form>
  );
}

export function MessageTools({
  id,
  archived,
}: {
  id: number;
  archived: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  function set(flags: { unread?: boolean; archived?: boolean }) {
    startTransition(async () => {
      await setMessageFlagsAction(id, flags);
      router.refresh();
    });
  }
  return (
    <div className="flex items-center gap-3 text-xs">
      <button
        type="button"
        disabled={pending}
        onClick={() => set({ unread: true })}
        className="text-muted transition-colors hover:text-foreground"
      >
        标为未读
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => set({ archived: !archived })}
        className="text-muted transition-colors hover:text-foreground"
      >
        {archived ? "移回收件箱" : "归档"}
      </button>
    </div>
  );
}
