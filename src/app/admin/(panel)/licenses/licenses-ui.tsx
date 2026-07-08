"use client";

import { useState, useTransition } from "react";
import { useActionState } from "react";
import {
  generateLicenseAction,
  revealLicenseKeyAction,
  setLicenseStatusAction,
  type GenerateState,
} from "@/app/admin/license-actions";

const field =
  "rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand";

export type LicenseRow = {
  id: number;
  licenseUid: string;
  keyLast4: string;
  plan: "personal" | "family";
  seats: number;
  used: number;
  status: string;
  source: string;
  note: string | null;
  email: string | null;
  orderNo: string | null;
  createdAt: string;
};

/* ── 生成 ─────────────────────────────────────────────────── */

export function GenerateForm() {
  const [state, action, pending] = useActionState<GenerateState, FormData>(
    generateLicenseAction,
    {},
  );

  return (
    <section className="rounded-2xl border border-border p-6">
      <h2 className="text-base font-semibold text-foreground">手动生成激活码</h2>
      <form action={action} className="mt-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-muted">套餐</span>
          <select name="plan" className={`${field} min-w-[10rem]`}>
            <option value="personal">个人版 · 1 台</option>
            <option value="family">家庭版 · 5 台</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-muted">备注（渠道/用途，选填）</span>
          <input
            name="note"
            placeholder="如：淘宝卡密 #3 / 送测"
            className={`${field} min-w-[16rem]`}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-muted">绑定邮箱（选填）</span>
          <input name="email" type="email" className={`${field} min-w-[14rem]`} />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-bg transition-opacity disabled:opacity-50"
        >
          {pending ? "生成中…" : "生成激活码"}
        </button>
      </form>

      {state.error && <p className="mt-3 text-sm text-red-400">{state.error}</p>}
      {state.key && state.licenseId && (
        <div className="mt-5 rounded-xl border border-brand/30 bg-brand/5 p-5">
          <p className="text-xs text-muted">
            已生成（{state.plan === "family" ? "家庭版 · 5 台" : "个人版 · 1 台"}）
            —— 请立即复制或保存二维码：
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <code className="select-all font-mono text-lg font-semibold tracking-wide text-foreground">
              {state.key}
            </code>
            <CopyButton text={state.key} />
          </div>
          <QrBlock licenseId={state.licenseId} />
        </div>
      )}
    </section>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="rounded-full border border-border px-3 py-1 text-xs text-muted transition-colors hover:text-foreground"
    >
      {copied ? "已复制 ✓" : "复制"}
    </button>
  );
}

function QrBlock({ licenseId }: { licenseId: number }) {
  const [show, setShow] = useState(false);
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="text-xs text-brand underline-offset-2 hover:underline"
      >
        {show ? "收起二维码" : "显示二维码（扫码打开激活引导页）"}
      </button>
      {show && (
        <div className="mt-3 inline-block rounded-xl bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/admin/license-qr/${licenseId}`}
            alt="激活二维码"
            width={200}
            height={200}
          />
        </div>
      )}
    </div>
  );
}

/* ── 列表 ─────────────────────────────────────────────────── */

const STATUS_LABEL: Record<string, string> = {
  active: "有效",
  revoked: "已吊销",
  refunded: "已退款",
};

export function LicenseTable({ licenses }: { licenses: LicenseRow[] }) {
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const [revealed, setRevealed] = useState<Record<number, string>>({});
  const [qrFor, setQrFor] = useState<number | null>(null);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? licenses.filter(
        (l) =>
          l.keyLast4.includes(q) ||
          (l.email ?? "").toLowerCase().includes(q) ||
          (l.note ?? "").toLowerCase().includes(q) ||
          (l.orderNo ?? "").toLowerCase().includes(q) ||
          l.licenseUid.toLowerCase().includes(q),
      )
    : licenses;

  function setStatus(id: number, status: "active" | "revoked") {
    startTransition(async () => {
      await setLicenseStatusAction(id, status);
    });
  }

  async function reveal(id: number) {
    const res = await revealLicenseKeyAction(id);
    if (res.key) setRevealed((m) => ({ ...m, [id]: res.key! }));
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">
          已签发（{licenses.length}）
        </h2>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索：末4位 / 邮箱 / 备注 / 订单号"
          className={`${field} min-w-[18rem]`}
        />
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted">
              <th className="px-4 py-3 font-medium">激活码</th>
              <th className="px-4 py-3 font-medium">套餐</th>
              <th className="px-4 py-3 font-medium">已用/上限</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium">来源</th>
              <th className="px-4 py-3 font-medium">邮箱/备注</th>
              <th className="px-4 py-3 font-medium">时间</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id} className="border-b border-border/50 align-top">
                <td className="px-4 py-2.5">
                  {revealed[l.id] ? (
                    <div className="flex items-center gap-2">
                      <code className="select-all font-mono text-[13px] text-foreground">
                        {revealed[l.id]}
                      </code>
                      <CopyButton text={revealed[l.id]} />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => reveal(l.id)}
                      className="font-mono text-[13px] text-muted transition-colors hover:text-foreground"
                      title="点击显示完整激活码"
                    >
                      ······{l.keyLast4}
                    </button>
                  )}
                </td>
                <td className="px-4 py-2.5 text-foreground">
                  {l.plan === "family" ? "家庭" : "个人"}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={
                      l.used >= l.seats ? "text-amber-400" : "text-foreground"
                    }
                  >
                    {l.used}/{l.seats}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={
                      l.status === "active"
                        ? "text-emerald-400"
                        : "text-red-400"
                    }
                  >
                    {STATUS_LABEL[l.status] ?? l.status}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-muted">
                  {l.source === "manual" ? "手动" : "购买"}
                </td>
                <td className="max-w-[220px] px-4 py-2.5 text-muted">
                  <div className="truncate">{l.email ?? "—"}</div>
                  {l.note && (
                    <div className="truncate text-xs text-faint">{l.note}</div>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-xs text-faint">
                  {l.createdAt.slice(0, 10)}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right">
                  <button
                    type="button"
                    onClick={() => setQrFor(qrFor === l.id ? null : l.id)}
                    className="mr-3 text-xs text-muted transition-colors hover:text-foreground"
                  >
                    二维码
                  </button>
                  {l.status === "active" ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => setStatus(l.id, "revoked")}
                      className="text-xs text-red-400/80 transition-colors hover:text-red-400"
                    >
                      吊销
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => setStatus(l.id, "active")}
                      className="text-xs text-emerald-400/80 transition-colors hover:text-emerald-400"
                    >
                      恢复
                    </button>
                  )}
                  {qrFor === l.id && (
                    <div className="mt-2 inline-block rounded-xl bg-white p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/api/admin/license-qr/${l.id}`}
                        alt="激活二维码"
                        width={140}
                        height={140}
                      />
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-faint">
                  没有匹配的激活码
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
