"use client";

import { useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Band, Wrap, BandHeading } from "@/components/mac/mac-ui";
import { Reveal } from "@/components/ui/reveal";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { CheckGlyph } from "@/components/mac/icons";
import { ArrowIcon } from "@/components/ui/button";
import { startCheckout } from "@/app/actions/checkout";
import { cn } from "@/lib/utils";

export type PlanView = {
  id: "personal" | "family";
  amountLabel: string;
  compareLabel: string | null;
  discount: number | null;
};

export function MacBuy({
  canBuy,
  plans,
  canceled,
}: {
  canBuy: boolean;
  plans: PlanView[];
  canceled?: boolean;
}) {
  const t = useTranslations("mac.buy");
  const locale = useLocale();
  const features = t.raw("features") as string[];
  const trust = t.raw("trust") as string[];
  const [pending, startTransition] = useTransition();
  const [busyPlan, setBusyPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function buy(planId: string) {
    setError(null);
    setBusyPlan(planId);
    startTransition(async () => {
      const res = await startCheckout(planId, locale);
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
