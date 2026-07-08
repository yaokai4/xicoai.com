"use client";

import { useState, useTransition } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  createMailUserAction,
  deleteMailUserAction,
  resetMailPasswordAction,
  setAliasesAction,
  type MailUserActionState,
} from "@/app/admin/mail-users-actions";

const field =
  "rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand";

export type MailUserRow = {
  id: string;
  email: string;
  displayName: string | null;
  aliases: string[];
  usedQuota: number;
};

function CredentialCard({
  account,
  password,
}: {
  account: string;
  password: string;
}) {
  const [copied, setCopied] = useState(false);
  const domain = account.split("@")[1];
  const text = `邮箱：${account}\n密码：${password}\n收件 IMAP：mail.${domain} 端口 993（SSL）\n发件 SMTP：mail.${domain} 端口 465（SSL）或 587（STARTTLS）\n用户名请填完整邮箱地址。`;
  return (
    <div className="mt-4 rounded-xl border border-brand/30 bg-brand/5 p-5">
      <p className="text-xs text-muted">
        账号已就绪——密码只显示这一次，请立即复制发给使用者：
      </p>
      <p className="mt-2 font-mono text-sm text-foreground">
        {account}
        <span className="mx-3 text-faint">密码</span>
        <code className="select-all font-semibold tracking-wide">{password}</code>
      </p>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        }}
        className="mt-3 rounded-full border border-border px-4 py-1.5 text-xs text-muted transition-colors hover:text-foreground"
      >
        {copied ? "已复制配置卡片 ✓" : "复制完整配置卡片（含服务器参数）"}
      </button>
    </div>
  );
}

export function CreateUserForm({ domain }: { domain: string }) {
  const [state, action, pending] = useActionState<
    MailUserActionState,
    FormData
  >(createMailUserAction, {});

  return (
    <section className="rounded-2xl border border-border p-6">
      <h2 className="text-base font-semibold text-foreground">新建邮箱账号</h2>
      <form action={action} className="mt-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-muted">账号</span>
          <span className="flex items-center gap-1">
            <input
              name="local"
              placeholder="kevin"
              className={`${field} w-[11rem]`}
            />
            <span className="text-sm text-muted">@{domain}</span>
          </span>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-muted">显示名（选填）</span>
          <input name="displayName" placeholder="Kevin / 客服" className={field} />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-bg transition-opacity disabled:opacity-50"
        >
          {pending ? "创建中…" : "创建（自动生成密码）"}
        </button>
      </form>
      {state.error && <p className="mt-3 text-sm text-red-400">{state.error}</p>}
      {state.ok && state.account && state.password && (
        <CredentialCard account={state.account} password={state.password} />
      )}
    </section>
  );
}

export function MailUserTable({
  users,
  domain,
}: {
  users: MailUserRow[];
  domain: string;
}) {
  const [pending, startTransition] = useTransition();
  const [credential, setCredential] = useState<{
    account: string;
    password: string;
  } | null>(null);
  const [aliasFor, setAliasFor] = useState<MailUserRow | null>(null);
  const [aliasText, setAliasText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function resetPassword(u: MailUserRow) {
    if (!confirm(`确认重置 ${u.email} 的密码？旧密码将立即失效。`)) return;
    startTransition(async () => {
      const res = await resetMailPasswordAction(u.id, u.email);
      setError(res.error ?? null);
      if (res.ok && res.password) {
        setCredential({ account: u.email, password: res.password });
      }
    });
  }

  function remove(u: MailUserRow) {
    if (
      !confirm(`确认删除 ${u.email}？该邮箱的所有邮件将被删除，且无法恢复。`)
    )
      return;
    startTransition(async () => {
      const res = await deleteMailUserAction(u.id);
      setError(res.error ?? null);
      router.refresh();
    });
  }

  function openAliases(u: MailUserRow) {
    setAliasFor(u);
    setAliasText(
      u.aliases.map((a) => a.replace(`@${domain}`, "")).join("\n"),
    );
  }

  function saveAliases() {
    if (!aliasFor) return;
    startTransition(async () => {
      const res = await setAliasesAction(aliasFor.id, aliasText);
      setError(res.error ?? null);
      if (!res.error) setAliasFor(null);
      router.refresh();
    });
  }

  return (
    <section>
      <h2 className="text-base font-semibold text-foreground">
        账号（{users.length}）
      </h2>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      {credential && (
        <CredentialCard
          account={credential.account}
          password={credential.password}
        />
      )}

      <div className="mt-4 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted">
              <th className="px-4 py-3 font-medium">邮箱</th>
              <th className="px-4 py-3 font-medium">显示名</th>
              <th className="px-4 py-3 font-medium">别名/收信地址</th>
              <th className="px-4 py-3 font-medium">已用</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border/50 align-top">
                <td className="px-4 py-2.5 font-mono text-[13px] text-foreground">
                  {u.email}
                </td>
                <td className="px-4 py-2.5 text-muted">
                  {u.displayName ?? "—"}
                </td>
                <td className="max-w-[240px] px-4 py-2.5 text-xs text-muted">
                  {u.aliases.length
                    ? u.aliases.map((a) => (
                        <span
                          key={a}
                          className="mr-1.5 inline-block rounded border border-border px-1.5 py-0.5"
                        >
                          {a}
                        </span>
                      ))
                    : "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-muted">
                  {(u.usedQuota / 1024 / 1024).toFixed(0)} MB
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right text-xs">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => openAliases(u)}
                    className="mr-3 text-muted transition-colors hover:text-foreground"
                  >
                    别名
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => resetPassword(u)}
                    className="mr-3 text-muted transition-colors hover:text-foreground"
                  >
                    重置密码
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => remove(u)}
                    className="text-red-400/70 transition-colors hover:text-red-400"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
            {!users.length && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-faint">
                  还没有邮箱账号，用上方表单创建第一个
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {aliasFor && (
        <div className="mt-4 rounded-2xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground">
            {aliasFor.email} 的别名
          </h3>
          <p className="mt-1 text-xs text-faint">
            每行一个（只写 @ 前面的部分，如 <code>support</code>）。发往这些地址的邮件都会进入此邮箱。
          </p>
          <textarea
            value={aliasText}
            onChange={(e) => setAliasText(e.target.value)}
            rows={4}
            className={`${field} mt-3 w-full max-w-md font-mono text-xs`}
          />
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              disabled={pending}
              onClick={saveAliases}
              className="rounded-full bg-foreground px-4 py-2 text-xs font-medium text-bg disabled:opacity-50"
            >
              保存
            </button>
            <button
              type="button"
              onClick={() => setAliasFor(null)}
              className="rounded-full border border-border px-4 py-2 text-xs text-muted"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
