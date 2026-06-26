"use client";

import { useActionState } from "react";
import { saveSettings, type ActionState } from "@/app/admin/actions";
import { SOCIAL_PLATFORMS } from "@/lib/social";

export function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    saveSettings,
    {},
  );

  return (
    <form action={action} className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-foreground">
        社交链接
      </h1>
      <p className="mt-2 text-sm text-muted">
        填写各平台主页链接，会显示在网站页脚（使用各平台真实 Logo）。留空的平台不会显示。
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {SOCIAL_PLATFORMS.map((p) => (
          <label key={p.key} className="flex items-center gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-muted">
              <svg
                width="20"
                height="20"
                viewBox={p.viewBox}
                fill="currentColor"
                aria-hidden
              >
                <path d={p.d} />
              </svg>
            </span>
            <span className="w-20 shrink-0 text-sm text-foreground">
              {p.label}
            </span>
            <input
              name={p.key}
              type="url"
              defaultValue={initial[p.key] ?? ""}
              placeholder="https://…"
              className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand"
            />
          </label>
        ))}
      </div>

      {state.error && (
        <p className="mt-4 text-sm text-red-400">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-8 inline-flex items-center justify-center rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-bg transition-opacity disabled:opacity-50"
      >
        {pending ? "保存中…" : "保存"}
      </button>
    </form>
  );
}
