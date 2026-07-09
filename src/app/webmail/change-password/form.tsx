"use client";

import { useActionState } from "react";
import { changePasswordAction, type ChangePwState } from "@/app/webmail/_actions";

const field =
  "w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-brand";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState<ChangePwState, FormData>(
    changePasswordAction,
    {},
  );

  return (
    <form action={action} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-muted">当前密码</span>
        <input
          name="current"
          type="password"
          autoComplete="current-password"
          className={field}
          autoFocus
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-muted">
          新密码（至少 8 位，建议字母+数字+符号，避免常见词）
        </span>
        <input
          name="next"
          type="password"
          autoComplete="new-password"
          className={field}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-muted">确认新密码</span>
        <input
          name="confirm"
          type="password"
          autoComplete="new-password"
          className={field}
        />
      </label>
      {state.error && <p className="text-sm text-red-500">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-50"
      >
        {pending ? "保存中…" : "保存新密码"}
      </button>
    </form>
  );
}
