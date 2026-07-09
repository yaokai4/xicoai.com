"use client";

import { useState } from "react";
import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  wmCreateUserAction,
  wmResetPasswordAction,
  wmSetAliasesAction,
  wmDeleteUserAction,
  type MailUserState,
} from "@/app/webmail/_admin-actions";

const field =
  "rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-brand";

export type UserRow = {
  id: string;
  email: string;
  displayName: string | null;
  aliases: string[];
};

function Credential({ account, password }: { account: string; password: string }) {
  const [copied, setCopied] = useState(false);
  const domain = account.split("@")[1];
  const card = `邮箱：${account}\n密码：${password}\n收件 IMAP：mail.${domain} 端口 993（SSL）\n发件 SMTP：mail.${domain} 端口 465（SSL）或 587（STARTTLS）\n网页登录：https://mail.${domain}`;
  return (
    <div className="mt-4 rounded-xl border border-brand/30 bg-brand/5 p-4">
      <p className="text-xs text-muted">密码只显示这一次，请复制发给使用者：</p>
      <p className="mt-2 font-mono text-sm text-foreground">
        {account} <span className="mx-2 text-faint">密码</span>
        <span className="select-all font-semibold">{password}</span>
      </p>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(card);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="mt-2 rounded-full border border-border px-3 py-1 text-xs text-muted hover:text-foreground"
      >
        {copied ? "已复制 ✓" : "复制配置卡片"}
      </button>
    </div>
  );
}

export function AdminPanel({
  users,
  domain,
}: {
  users: UserRow[];
  domain: string;
}) {
  const [state, action, pending] = useActionState<MailUserState, FormData>(
    wmCreateUserAction,
    {},
  );
  const [busy, startTransition] = useTransition();
  const [cred, setCred] = useState<{ account: string; password: string } | null>(null);
  const [aliasFor, setAliasFor] = useState<UserRow | null>(null);
  const [aliasText, setAliasText] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  function reset(u: UserRow) {
    if (!confirm(`重置 ${u.email} 的密码？旧密码立即失效。`)) return;
    startTransition(async () => {
      const r = await wmResetPasswordAction(u.id, u.email);
      setErr(r.error ?? null);
      if (r.ok && r.password) setCred({ account: u.email, password: r.password });
    });
  }
  function remove(u: UserRow) {
    if (!confirm(`删除 ${u.email}？该邮箱所有邮件将被删除且不可恢复。`)) return;
    startTransition(async () => {
      const r = await wmDeleteUserAction(u.id);
      setErr(r.error ?? null);
      router.refresh();
    });
  }
  function saveAliases() {
    if (!aliasFor) return;
    startTransition(async () => {
      const r = await wmSetAliasesAction(aliasFor.id, aliasText);
      setErr(r.error ?? null);
      if (!r.error) setAliasFor(null);
      router.refresh();
    });
  }

  return (
    <div className="max-w-4xl">
      <section className="rounded-2xl border border-border p-5">
        <h2 className="text-sm font-semibold text-foreground">新建邮箱账号</h2>
        <form action={action} className="mt-3 flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-muted">账号</span>
            <span className="flex items-center gap-1">
              <input name="local" placeholder="kevin" className={`${field} w-40`} />
              <span className="text-sm text-muted">@{domain}</span>
            </span>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-muted">显示名（选填）</span>
            <input name="displayName" placeholder="Kevin" className={field} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-muted">初始密码（选填，留空自动生成）</span>
            <input
              name="password"
              type="text"
              placeholder="≥8 位"
              className={field}
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending ? "创建中…" : "创建"}
          </button>
        </form>
        <p className="mt-2 text-xs text-faint">
          新用户首次登录会被要求把初始密码改成自己的密码。
        </p>
        {state.error && <p className="mt-2 text-sm text-red-500">{state.error}</p>}
        {state.ok && state.account && state.password && (
          <Credential account={state.account} password={state.password} />
        )}
      </section>

      {err && <p className="mt-3 text-sm text-red-500">{err}</p>}
      {cred && <Credential account={cred.account} password={cred.password} />}

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-foreground">
          账号（{users.length}）
        </h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-4 py-2.5 font-medium">邮箱</th>
                <th className="px-4 py-2.5 font-medium">显示名</th>
                <th className="px-4 py-2.5 font-medium">别名</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border/50">
                  <td className="px-4 py-2.5 font-mono text-[13px] text-foreground">
                    {u.email}
                  </td>
                  <td className="px-4 py-2.5 text-muted">{u.displayName ?? "—"}</td>
                  <td className="max-w-[200px] px-4 py-2.5 text-xs text-muted">
                    {u.aliases.length
                      ? u.aliases.map((a) => a.split("@")[0]).join("、")
                      : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-right text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setAliasFor(u);
                        setAliasText(u.aliases.map((a) => a.split("@")[0]).join("\n"));
                      }}
                      disabled={busy}
                      className="mr-3 text-muted hover:text-foreground"
                    >
                      别名
                    </button>
                    <button
                      type="button"
                      onClick={() => reset(u)}
                      disabled={busy}
                      className="mr-3 text-muted hover:text-foreground"
                    >
                      改密
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(u)}
                      disabled={busy}
                      className="text-red-400/70 hover:text-red-400"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
              {!users.length && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-faint">
                    还没有账号
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {aliasFor && (
        <div className="mt-4 max-w-md rounded-2xl border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground">
            {aliasFor.email} 的别名
          </h3>
          <p className="mt-1 text-xs text-faint">
            每行一个，只写 @ 前面的部分（如 support）。发往这些地址的邮件都会进此邮箱。
          </p>
          <textarea
            value={aliasText}
            onChange={(e) => setAliasText(e.target.value)}
            rows={3}
            className={`${field} mt-2 w-full font-mono text-xs`}
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={saveAliases}
              disabled={busy}
              className="rounded-lg bg-brand px-4 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              保存
            </button>
            <button
              type="button"
              onClick={() => setAliasFor(null)}
              className="rounded-lg border border-border px-4 py-1.5 text-xs text-muted"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
