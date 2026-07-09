"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Band, Wrap, BandHeading } from "@/components/mac/mac-ui";
import { Reveal } from "@/components/ui/reveal";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { CheckGlyph } from "@/components/mac/icons";
import { ArrowIcon } from "@/components/ui/button";
import { startCheckout } from "@/app/actions/checkout";
import { LOCALE_TAG } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export type PlanView = {
  id: "personal" | "family";
  amountLabel: string;
  compareLabel: string | null;
  discount: number | null;
};

export function MacBuy({
  canBuy,
  currencies,
  initialCurrency,
  plansByCurrency,
  canceled,
}: {
  canBuy: boolean;
  currencies: string[];
  initialCurrency: string;
  plansByCurrency: Record<string, PlanView[]>;
  canceled?: boolean;
}) {
  const t = useTranslations("mac.buy");
  const locale = useLocale();
  const features = t.raw("features") as string[];
  const trust = t.raw("trust") as string[];
  const [pending, startTransition] = useTransition();
  const [busyPlan, setBusyPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState(
    plansByCurrency[initialCurrency] ? initialCurrency : currencies[0],
  );
  const [picker, setPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const plans = plansByCurrency[currency] ?? [];

  // Localized currency names for the (collapsed) switcher, e.g. "US Dollar".
  const localeTag = LOCALE_TAG[locale] ?? "en-US";
  let currencyName: (c: string) => string;
  try {
    const dn = new Intl.DisplayNames([localeTag], { type: "currency" });
    currencyName = (c) => dn.of(c) ?? c;
  } catch {
    currencyName = (c) => c;
  }

  // Close the currency menu on outside click.
  useEffect(() => {
    if (!picker) return;
    const onClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPicker(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [picker]);

  function buy(planId: string) {
    setError(null);
    setBusyPlan(planId);
    startTransition(async () => {
      const res = await startCheckout(planId, locale, currency);
      if (res.ok && res.url) {
        window.location.assign(res.url);
      } else {
        setBusyPlan(null);
        setError(res.error === "unavailable" ? "unavailable" : "server");
      }
    });
  }

  return (
    <Band id="buy" tone="surface" className="pt-32 pb-24 sm:pt-40 sm:pb-32">
      <Wrap>
        <BandHeading
          kicker={t("eyebrow")}
          title={t("title")}
          lede={t("subtitle")}
        />

        {canceled && (
          <Reveal>
            <p className="mx-auto mt-8 max-w-md rounded-2xl border border-amber-400/30 bg-amber-400/10 px-5 py-3 text-center text-sm text-amber-600 dark:text-amber-300">
              {t("canceledNote")}
            </p>
          </Reveal>
        )}

        {/* Prices are quoted in the visitor's own local currency (detected
            from their region). We show that one currency — not every country's
            at once — with a discreet menu to switch if they prefer another. */}
        {canBuy && (
          <Reveal>
            <div className="mt-8 flex items-center justify-center">
              {currencies.length > 1 ? (
                <div className="relative" ref={pickerRef}>
                  <button
                    type="button"
                    onClick={() => setPicker((v) => !v)}
                    aria-haspopup="listbox"
                    aria-expanded={picker}
                    className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-border-strong hover:text-foreground"
                  >
                    <GlobeGlyph />
                    {t("currencyNote", { currency })}
                    <CaretGlyph className={cn("transition-transform", picker && "rotate-180")} />
                  </button>
                  {picker && (
                    <div
                      role="listbox"
                      className="absolute left-1/2 z-30 mt-2 max-h-72 w-60 -translate-x-1/2 overflow-auto rounded-2xl border border-border bg-bg p-1.5 shadow-[0_24px_60px_-24px_rgba(10,8,40,0.35)]"
                    >
                      {currencies.map((c) => (
                        <button
                          key={c}
                          type="button"
                          role="option"
                          aria-selected={c === currency}
                          onClick={() => {
                            setCurrency(c);
                            setPicker(false);
                          }}
                          className={cn(
                            "flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2 text-left text-sm transition-colors",
                            c === currency
                              ? "bg-brand/10 text-brand"
                              : "text-foreground/90 hover:bg-surface",
                          )}
                        >
                          <span className="truncate">{currencyName(c)}</span>
                          <span className="shrink-0 font-medium tabular-nums text-faint">
                            {c}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <span className="inline-flex items-center gap-2 text-sm text-faint">
                  <GlobeGlyph />
                  {t("currencyNote", { currency })}
                </span>
              )}
            </div>
          </Reveal>
        )}

        <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
          {plans.map((plan, i) => {
            const recommended = plan.id === "family";
            const busy = busyPlan === plan.id && pending;
            return (
              <Reveal key={plan.id} delay={i * 0.08}>
                <SpotlightCard
                  className={cn(
                    "relative flex h-full flex-col rounded-[2rem] border bg-bg p-8 sm:p-9",
                    recommended
                      ? "border-brand/40 shadow-[0_20px_60px_-30px_color-mix(in_oklab,var(--brand)_55%,transparent)]"
                      : "border-border",
                  )}
                >
                  {recommended && (
                    <span className="absolute right-6 top-7 rounded-full bg-brand/12 px-3 py-1 text-xs font-semibold text-brand">
                      {t("recommended")}
                    </span>
                  )}

                  <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
                    {t(`plans.${plan.id}.name`)}
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    {t(`plans.${plan.id}.devices`)}
                  </p>

                  <div className="mt-6 flex items-end gap-2.5">
                    <span className="font-display text-[2.75rem] font-semibold leading-none tracking-tight text-gradient">
                      {plan.amountLabel}
                    </span>
                    {plan.compareLabel && (
                      <span className="pb-1 text-base text-faint line-through">
                        {plan.compareLabel}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className="text-faint">{t("perpetual")}</span>
                    {plan.discount != null && (
                      <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
                        {t("save", { percent: plan.discount })}
                      </span>
                    )}
                  </div>

                  <ul className="mt-7 flex flex-col gap-3 text-left">
                    {features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-3 text-[15px] text-foreground/90"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                          <CheckGlyph className="h-3 w-3" />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 flex-1" />

                  {canBuy ? (
                    <button
                      type="button"
                      onClick={() => buy(plan.id)}
                      disabled={pending}
                      className={cn(
                        "group/btn inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] disabled:opacity-60",
                        recommended
                          ? "bg-brand text-white hover:-translate-y-0.5"
                          : "bg-foreground text-bg hover:-translate-y-0.5",
                      )}
                    >
                      {busy ? t("ctaLoading") : t("cta")}
                      {!busy && <ArrowIcon />}
                    </button>
                  ) : (
                    <Link
                      href="/mac#download"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5"
                    >
                      {t("comingSoonCta")}
                    </Link>
                  )}
                </SpotlightCard>
              </Reveal>
            );
          })}
        </div>

        {error && (
          <p className="mt-6 text-center text-sm text-red-500">
            {error === "unavailable" ? t("comingSoon") : t("errorNote")}
          </p>
        )}

        <Reveal delay={0.1}>
          <ul className="mx-auto mt-12 flex max-w-2xl flex-col gap-2 sm:flex-row sm:justify-center sm:gap-8">
            {trust.map((line) => (
              <li
                key={line}
                className="flex items-center justify-center gap-2 text-sm text-muted"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {line}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mx-auto mt-8 max-w-xl text-center text-sm text-faint text-pretty">
            {t("activateNote")}
          </p>
        </Reveal>
      </Wrap>
    </Band>
  );
}

function GlobeGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M3 12h18M12 3c2.5 2.4 3.8 5.6 3.8 9s-1.3 6.6-3.8 9c-2.5-2.4-3.8-5.6-3.8-9S9.5 5.4 12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CaretGlyph({ className }: { className?: string }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
