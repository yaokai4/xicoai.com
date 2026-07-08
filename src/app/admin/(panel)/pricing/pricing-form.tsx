"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import { saveMacPricing, type ActionState } from "@/app/admin/actions";
import {
  SUGGESTED_CURRENCY_PRESETS,
  type CurrencyPricing,
  type MacPricing,
  type PlanId,
} from "@/lib/pricing";

const field =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand";

type Row = { code: string; pricing: CurrencyPricing };

const EMPTY: CurrencyPricing = {
  personal: { amount: 0, compareAt: null },
  family: { amount: 0, compareAt: null },
};

export function PricingForm({ initial }: { initial: MacPricing }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    saveMacPricing,
    {},
  );

  const [active, setActive] = useState(initial.active);
  const [defaultCurrency, setDefaultCurrency] = useState(
    initial.defaultCurrency,
  );
  const [rows, setRows] = useState<Row[]>(
    Object.entries(initial.currencies).map(([code, pricing]) => ({
      code,
      pricing,
    })),
  );
  const [newCode, setNewCode] = useState("");

  const payload = useMemo(() => {
    const currencies: Record<string, CurrencyPricing> = {};
    for (const r of rows) currencies[r.code] = r.pricing;
    return JSON.stringify({
      active,
      defaultCurrency: currencies[defaultCurrency]
        ? defaultCurrency
        : rows[0]?.code,
      currencies,
    });
  }, [rows, active, defaultCurrency]);

  function setPrice(
    code: string,
    plan: PlanId,
    key: "amount" | "compareAt",
    value: string,
  ) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.code !== code) return r;
        const n = value.trim() === "" ? null : Number(value);
        const v = n != null && Number.isFinite(n) && n >= 0 ? n : null;
        return {
          ...r,
          pricing: {
            ...r.pricing,
            [plan]: {
              ...r.pricing[plan],
              [key]: key === "amount" ? (v ?? 0) : v,
            },
          },
        };
      }),
    );
  }

  function addCurrency() {
    const code = newCode.trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(code) || rows.some((r) => r.code === code)) return;
    setRows((prev) => [
      ...prev,
      { code, pricing: SUGGESTED_CURRENCY_PRESETS[code] ?? EMPTY },
    ]);
    setNewCode("");
  }

  function removeCurrency(code: string) {
    setRows((prev) => prev.filter((r) => r.code !== code));
  }

  const presetChoices = Object.keys(SUGGESTED_CURRENCY_PRESETS).filter(
    (c) => !rows.some((r) => r.code === c),
  );

  return (
    <form action={action} className="max-w-4xl">
      <input type="hidden" name="payload" value={payload} />

      <h1 className="font-display text-2xl font-semibold text-foreground">
        Xico Clean 定价（多币种）
      </h1>
      <p className="mt-2 text-sm text-muted">
        每种币种独立定价，购买页按访客 IP 国家/语言自动选择币种（也可手动切换）。
        价格以「主单位」填写（如 38 表示 ¥38、5.99 表示 $5.99）；「原价」高于「现价」时
        显示划线价与折扣角标。改动即时生效。
      </p>

      <div className="mt-8 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted">
              <th className="px-4 py-3 font-medium">币种</th>
              <th className="px-4 py-3 font-medium">个人版 现价</th>
              <th className="px-4 py-3 font-medium">个人版 原价</th>
              <th className="px-4 py-3 font-medium">家庭版 现价</th>
              <th className="px-4 py-3 font-medium">家庭版 原价</th>
              <th className="px-4 py-3 font-medium">默认</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.code} className="border-b border-border/50">
                <td className="px-4 py-2 font-mono text-foreground">{r.code}</td>
                {(["personal", "family"] as PlanId[]).map((plan) => (
                  <PriceCells
                    key={plan}
                    row={r}
                    plan={plan}
                    onChange={(k, v) => setPrice(r.code, plan, k, v)}
                  />
                ))}
                <td className="px-4 py-2">
                  <input
                    type="radio"
                    name="_default"
                    checked={defaultCurrency === r.code}
                    onChange={() => setDefaultCurrency(r.code)}
                    className="h-4 w-4 accent-[var(--brand)]"
                  />
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => removeCurrency(r.code)}
                    disabled={rows.length <= 1}
                    className="text-xs text-faint transition-colors hover:text-red-400 disabled:opacity-30"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          value={newCode}
          onChange={(e) => setNewCode(e.target.value)}
          placeholder="新增币种代码（如 EUR）"
          className={`${field} max-w-[14rem] uppercase`}
        />
        <button
          type="button"
          onClick={addCurrency}
          className="rounded-full border border-border px-4 py-2 text-sm text-foreground transition-colors hover:border-border-strong"
        >
          + 添加
        </button>
        {presetChoices.length > 0 && (
          <span className="text-xs text-faint">
            快捷添加：
            {presetChoices.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setRows((prev) => [
                    ...prev,
                    { code: c, pricing: SUGGESTED_CURRENCY_PRESETS[c] },
                  ]);
                }}
                className="ml-1.5 rounded border border-border px-1.5 py-0.5 font-mono text-[11px] text-muted transition-colors hover:text-foreground"
              >
                {c}
              </button>
            ))}
            （预填建议价，可再改）
          </span>
        )}
      </div>

      <label className="mt-8 flex items-center gap-3">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="h-4 w-4 accent-[var(--brand)]"
        />
        <span className="text-sm text-foreground">
          开放购买（关闭时购买页显示「即将开放」并引导加入等候名单）
        </span>
      </label>
      <p className="mt-2 text-xs text-faint">
        结算货币按买家所在地展示，最终统一结算到 Stripe 账户本金币（JPY）。
        注意：需服务器已配置 <code>STRIPE_SECRET_KEY</code> 才会真正开放结账。
      </p>

      {state.error && <p className="mt-4 text-sm text-red-400">{state.error}</p>}

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

function PriceCells({
  row,
  plan,
  onChange,
}: {
  row: Row;
  plan: PlanId;
  onChange: (key: "amount" | "compareAt", value: string) => void;
}) {
  return (
    <>
      <td className="px-4 py-2">
        <input
          type="number"
          min={0}
          step="0.01"
          defaultValue={row.pricing[plan].amount || ""}
          onChange={(e) => onChange("amount", e.target.value)}
          className={`${field} max-w-[7.5rem]`}
        />
      </td>
      <td className="px-4 py-2">
        <input
          type="number"
          min={0}
          step="0.01"
          defaultValue={row.pricing[plan].compareAt ?? ""}
          placeholder="—"
          onChange={(e) => onChange("compareAt", e.target.value)}
          className={`${field} max-w-[7.5rem]`}
        />
      </td>
    </>
  );
}
