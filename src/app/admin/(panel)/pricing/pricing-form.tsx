"use client";

import { useActionState } from "react";
import { saveMacPricing, type ActionState } from "@/app/admin/actions";
import type { MacPricing } from "@/lib/pricing";

const field =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand";

export function PricingForm({ initial }: { initial: MacPricing }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    saveMacPricing,
    {},
  );

  return (
    <form action={action} className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-foreground">
        Xico Clean 定价
      </h1>
      <p className="mt-2 text-sm text-muted">
        设置买断价、币种与折扣。价格以「主单位」填写（如 128 表示 ¥128）；
        「原价」高于「现价」时，购买页会显示划线原价与折扣角标。改动即时生效。
      </p>

      <div className="mt-8 flex flex-col gap-6">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">币种（ISO 4217）</span>
          <input
            name="currency"
            defaultValue={initial.currency}
            placeholder="CNY / JPY / USD"
            className={`${field} max-w-[12rem] uppercase`}
          />
          <span className="text-xs text-faint">
            如 CNY（人民币）、JPY（日元）、USD（美元）。结算到 Stripe 账户本金币。
          </span>
        </label>

        <fieldset className="rounded-xl border border-border p-4">
          <legend className="px-2 text-sm font-medium text-foreground">
            个人版 · 1 台 Mac
          </legend>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-muted">现价</span>
              <input
                name="personal_amount"
                type="number"
                min={0}
                step="0.01"
                defaultValue={initial.personal.amount}
                className={field}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-muted">原价（划线，选填）</span>
              <input
                name="personal_compareAt"
                type="number"
                min={0}
                step="0.01"
                defaultValue={initial.personal.compareAt ?? ""}
                placeholder="留空则不显示折扣"
                className={field}
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="rounded-xl border border-border p-4">
          <legend className="px-2 text-sm font-medium text-foreground">
            家庭版 · 最多 5 台 Mac
          </legend>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-muted">现价</span>
              <input
                name="family_amount"
                type="number"
                min={0}
                step="0.01"
                defaultValue={initial.family.amount}
                className={field}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-muted">原价（划线，选填）</span>
              <input
                name="family_compareAt"
                type="number"
                min={0}
                step="0.01"
                defaultValue={initial.family.compareAt ?? ""}
                placeholder="留空则不显示折扣"
                className={field}
              />
            </label>
          </div>
        </fieldset>

        <label className="flex items-center gap-3">
          <input
            name="active"
            type="checkbox"
            defaultChecked={initial.active}
            className="h-4 w-4 accent-[var(--brand)]"
          />
          <span className="text-sm text-foreground">
            开放购买（关闭时购买页显示「即将开放」并引导加入等候名单）
          </span>
        </label>
        <p className="-mt-3 text-xs text-faint">
          注意：即使勾选，也需服务器已配置 <code>STRIPE_SECRET_KEY</code> 才会真正开放结账。
        </p>
      </div>

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
