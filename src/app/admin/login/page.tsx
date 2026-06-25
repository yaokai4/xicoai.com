"use client";

import { useActionState } from "react";
import { loginAction, type ActionState } from "@/app/admin/actions";
import { Logo } from "@/components/brand/logo";

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    loginAction,
    {},
  );

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-between">
          <Logo wordmark="希可" />
          <span className="text-xs uppercase tracking-wider text-faint">
            Admin
          </span>
        </div>
        <form
          action={action}
          className="flex flex-col gap-5 rounded-3xl border border-border bg-surface/40 p-8"
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-sm text-muted">
              用户名
            </label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              className="rounded-xl border border-border bg-white/[0.02] px-4 py-3 text-foreground outline-none focus:border-brand/60"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm text-muted">
              密码
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="rounded-xl border border-border bg-white/[0.02] px-4 py-3 text-foreground outline-none focus:border-brand/60"
            />
          </div>
          {state.error && (
            <p className="text-sm text-red-400">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="mt-1 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-bg transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            {pending ? "登录中…" : "登录"}
          </button>
        </form>
      </div>
    </div>
  );
}
