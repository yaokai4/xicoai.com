"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/webmail/_actions";

const field =
  "w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-brand";

export function LoginForm({ expired }: { expired: boolean }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    loginAction,
    {},
  );

  return (
    <form action={action} className="flex flex-col gap-3">
      {expired && (
        <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-300">
          登录已过期或密码已更改，请重新登录。
        </p>
      )}
      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-muted">邮箱地址</span>
        <input
          name="email"
          type="email"
          autoComplete="username"
          placeholder="you@xicoai.com"
          className={field}
          autoFocus
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-muted">密码</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className={field}
        />
      </label>
      {state.error && <p className="text-sm text-red-500">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-50"
      >
        {pending ? "登录中…" : "登录"}
      </button>
    </form>
  );
}
