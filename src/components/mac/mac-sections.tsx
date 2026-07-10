/* eslint-disable @next/next/no-html-link-for-pages -- Download CTAs intentionally hit a file API route. */
import { Fragment } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/ui/reveal";
import {
  Band,
  Wrap,
  Kicker,
  BigTitle,
  Lede,
  BandHeading,
  MacWindow,
} from "@/components/mac/mac-ui";
import { FeatureGlyph, SafetyGlyph, CheckGlyph } from "@/components/mac/icons";
import { DeepDiveVisual, MiniTreemap } from "@/components/mac/visuals";
import { WaitlistForm } from "@/components/mac/waitlist-form";
import type { PlanView } from "@/components/mac/mac-buy";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const ArrowLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link
    href={href}
    className="group/link inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-brand-soft"
  >
    {children}
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className="transition-transform duration-300 group-hover/link:translate-x-0.5">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </Link>
);

/** A check-marked feature point. */
function PointRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 text-sm leading-relaxed text-muted">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/12 text-accent">
        <CheckGlyph className="h-3 w-3" />
      </span>
      {children}
    </div>
  );
}

/* ================= trust bar ================= */

const TRUST_GLYPHS = [
  // local privacy — lock
  "M6.5 10.5V8a5.5 5.5 0 1111 0v2.5M5 10.5h14V20H5zM12 14v2.5",
  // undoable — undo arrow
  "M9 14l-4-4 4-4M5 10h9a5 5 0 015 5v1",
  // 11 languages — globe
  "M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3c2.5 2.4 3.8 5.6 3.8 9s-1.3 6.6-3.8 9c-2.5-2.4-3.8-5.6-3.8-9S9.5 5.4 12 3z",
  // universal — cpu chip
  "M8 8h8v8H8zM5 5h14v14H5zM12 2v3M12 19v3M2 12h3M19 12h3",
];

export function MacTrustBar() {
  const t = useTranslations("mac.trustbar");
  const items = t.raw("items") as { title: string; desc: string }[];
  return (
    <Band tone="surface" className="py-10 sm:py-12">
      <Wrap>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
          {items.map((it, i) => (
            <Reveal key={it.title} y={12} duration={0.5} delay={i * 0.06}>
              <li className="flex items-start gap-3.5">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl mac-card text-brand">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d={TRUST_GLYPHS[i % TRUST_GLYPHS.length]}
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <div>
                  <div className="text-[15px] font-semibold text-foreground">
                    {it.title}
                  </div>
                  <div className="mt-0.5 text-[13px] leading-relaxed text-faint">
                    {it.desc}
                  </div>
                </div>
              </li>
            </Reveal>
          ))}
        </ul>
      </Wrap>
    </Band>
  );
}

/* ================= features bento ================= */

export function MacFeatures({ moreHref }: { moreHref?: string } = {}) {
  const t = useTranslations("mac.features");
  const tp = useTranslations("mac.pages");
  const ts = useTranslations("mac.shots");
  const items = t.raw("items") as { name: string; desc: string }[];
  return (
    <Band id="features" className="py-20 sm:py-28">
      <Wrap>
        <BandHeading
          kicker={t("eyebrow")}
          title={t("title")}
          lede={t("subtitle")}
        />
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 [grid-auto-flow:dense] sm:[grid-auto-rows:minmax(150px,auto)]">
          {items.map((f, i) => (
            <BentoTile key={f.name} f={f} i={i} shotAlt={ts("dashboard")} />
          ))}
        </div>
        {moreHref && (
          <div className="mt-12 text-center">
            <ArrowLink href={moreHref}>{tp("moreFeatures")}</ArrowLink>
          </div>
        )}
      </Wrap>
    </Band>
  );
}

function BentoTile({
  f,
  i,
  shotAlt,
}: {
  f: { name: string; desc: string };
  i: number;
  shotAlt: string;
}) {
  const hero = i === 0; // Smart Scan — big tile with a real (light-mode) shot
  const lens = i === 3; // Space Lens — wide tile with treemap sketch
  const menubar = i === 10; // Menu-bar monitor — wide tile with the real strip
  // Wide text tiles chosen so the 4-column grid fills exactly (24 cells).
  const wideText = i === 2 || i === 13 || i === 15;
  const span = hero
    ? "col-span-2 row-span-2"
    : lens || menubar || wideText
      ? "col-span-2"
      : "";
  return (
    <Reveal y={12} duration={0.5} delay={(i % 4) * 0.06} className={cn(span)}>
      <div
        className={cn(
          "mac-card mac-lift group flex h-full flex-col overflow-hidden rounded-[1.25rem] p-5",
          hero && "sm:p-7",
        )}
      >
        {!hero && !lens && !menubar && (
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-brand/10 text-brand">
            <FeatureGlyph index={i} className="h-[19px] w-[19px]" />
          </div>
        )}
        <h3
          className={cn(
            "font-display font-semibold text-foreground",
            hero ? "text-xl" : "text-[15px]",
          )}
        >
          {f.name}
        </h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted sm:text-sm">
          {f.desc}
        </p>
        {hero && (
          <div className="relative mt-6 min-h-[180px] flex-1 overflow-hidden rounded-t-lg border border-b-0 border-white/[0.08] sm:min-h-[240px]">
            <Image
              src="/shots-03/home-light.png"
              alt={shotAlt}
              fill
              sizes="(max-width: 640px) 100vw, 480px"
              className="object-cover object-left-top"
            />
          </div>
        )}
        {lens && (
          <div className="mt-5 flex-1 text-brand">
            <MiniTreemap />
          </div>
        )}
        {menubar && (
          <div className="mt-5 overflow-hidden rounded-lg border border-white/[0.08] bg-[#101322] px-2 py-1.5">
            <Image
              src="/shots-03/menubar-combined.png"
              alt={f.name}
              width={987}
              height={78}
              sizes="(max-width: 640px) 100vw, 440px"
              className="block h-auto w-full"
            />
          </div>
        )}
      </div>
    </Reveal>
  );
}

/* ================= Space Lens deep dive ================= */

export function MacLens() {
  const t = useTranslations("mac.lens");
  const cards = t.raw("cards") as { title: string; desc: string }[];
  return (
    <Band className="py-20 sm:py-28">
      <Wrap>
        <BandHeading kicker={t("eyebrow")} title={t("title")} lede={t("desc")} />

        <div className="mt-12 grid gap-6 md:grid-cols-2 md:gap-8">
          <Reveal y={12} duration={0.5}>
            <MacWindow
              src="/shots-03/spacelens-dark.png"
              alt={t("caption")}
              width={2160}
              height={1440}
              caption={t("caption")}
              sizes="(max-width: 768px) 100vw, 544px"
            />
          </Reveal>
          <Reveal y={12} duration={0.5} delay={0.1} className="md:mt-10">
            <MacWindow
              src="/shots-03/spacelens-drilled-dark.png"
              alt={t("captionDrilled")}
              width={2160}
              height={1440}
              caption={t("captionDrilled")}
              sizes="(max-width: 768px) 100vw, 544px"
            />
          </Reveal>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {cards.map((c, i) => (
            <Reveal key={c.title} y={12} duration={0.5} delay={(i % 4) * 0.06}>
              <div className="mac-card mac-lift h-full rounded-2xl p-5">
                <div className="text-[15px] font-semibold text-foreground">
                  {c.title}
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                  {c.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Wrap>
    </Band>
  );
}

/* ================= menu bar deep dive ================= */

export function MacMenubar() {
  const t = useTranslations("mac.menubar");
  const items = t.raw("items") as { title: string; desc: string }[];
  return (
    <Band tone="surface" className="py-20 sm:py-28">
      <Wrap>
        <BandHeading kicker={t("eyebrow")} title={t("title")} lede={t("desc")} />

        {/* the real menu-bar strips, floating on the canvas */}
        <div className="relative mx-auto mt-14 max-w-3xl">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-16 -inset-y-10 -z-10 opacity-60 blur-[90px]"
            style={{
              background:
                "radial-gradient(50% 60% at 50% 50%, rgba(124,151,242,0.16), transparent 75%)",
            }}
          />
          <Reveal y={12} duration={0.5}>
            <figure>
              <div className="overflow-hidden rounded-xl border border-white/[0.1] bg-[#101322] px-3 py-2 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.07)]">
                <Image
                  src="/shots-03/menubar-rich.png"
                  alt={t("caption")}
                  width={1179}
                  height={90}
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="block h-auto w-full"
                />
              </div>
              <figcaption className="mt-3 text-center text-xs text-faint">
                {t("caption")}
              </figcaption>
            </figure>
          </Reveal>
          <Reveal y={12} duration={0.5} delay={0.1}>
            <figure className="mx-auto mt-5 w-[86%] sm:w-[72%]">
              <div className="overflow-hidden rounded-lg border border-white/[0.08] bg-[#0e111d] px-2.5 py-1.5 shadow-[0_18px_44px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)]">
                <Image
                  src="/shots-03/menubar-combined.png"
                  alt={t("captionCombined")}
                  width={987}
                  height={78}
                  sizes="(max-width: 768px) 86vw, 553px"
                  className="block h-auto w-full"
                />
              </div>
              <figcaption className="mt-3 text-center text-xs text-faint">
                {t("captionCombined")}
              </figcaption>
            </figure>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5">
          {items.map((it, i) => (
            <Reveal key={it.title} y={12} duration={0.5} delay={(i % 5) * 0.06}>
              <div className="mac-card mac-lift h-full rounded-2xl p-5">
                <div className="font-display text-xs font-semibold tabular-nums text-brand">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="mt-2 text-[15px] font-semibold text-foreground">
                  {it.title}
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                  {it.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Wrap>
    </Band>
  );
}

/* ================= safety ================= */

export function MacSafety({ topPad = false }: { topPad?: boolean } = {}) {
  const t = useTranslations("mac.safety");
  const items = t.raw("items") as { title: string; desc: string }[];
  return (
    <Band
      id="safety"
      className={cn("py-20 sm:py-28", topPad && "pt-32 sm:pt-40")}
    >
      <Wrap>
        <BandHeading
          kicker={t("eyebrow")}
          title={t("title")}
          lede={t("subtitle")}
        />
        <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {items.map((s, i) => (
            <Reveal key={s.title} y={12} duration={0.5} delay={(i % 3) * 0.06}>
              <div className="mac-card mac-lift flex h-full flex-col rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
                    <SafetyGlyph index={i} className="h-[19px] w-[19px]" />
                  </span>
                  <span className="font-display text-xs font-semibold tabular-nums text-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-4 text-[15px] font-semibold text-foreground">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                  {s.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Wrap>
    </Band>
  );
}

/* ================= pricing (real plans, glass cards) ================= */

export function MacPricingSection({
  plans,
  active,
  topPad = false,
}: {
  plans: PlanView[];
  active: boolean;
  topPad?: boolean;
}) {
  const t = useTranslations("mac.pricing");
  const tb = useTranslations("mac.buy");
  const features = tb.raw("features") as string[];
  const trust = tb.raw("trust") as string[];
  const showPlans = active && plans.some((p) => p.amountLabel);

  return (
    <Band
      id="pricing"
      tone="surface"
      className={cn("py-20 sm:py-28", topPad && "pt-32 sm:pt-40")}
    >
      <Wrap>
        <BandHeading kicker={t("eyebrow")} title={t("title")} lede={t("subtitle")} />

        {showPlans ? (
          <>
            <div className="mx-auto mt-12 grid max-w-3xl gap-4 md:grid-cols-2 md:gap-6">
              {plans.map((plan, i) => {
                const recommended = plan.id === "family";
                return (
                  <Reveal key={plan.id} y={12} duration={0.5} delay={i * 0.08}>
                    <div
                      className={cn(
                        "mac-card relative flex h-full flex-col rounded-3xl p-7 sm:p-8",
                        recommended &&
                          "border-[rgba(167,144,240,0.4)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_70px_-32px_rgba(150,140,240,0.45)]",
                      )}
                    >
                      {recommended && (
                        <span className="absolute right-6 top-7 rounded-full bg-brand/15 px-3 py-1 text-xs font-semibold text-brand">
                          {tb("recommended")}
                        </span>
                      )}

                      <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
                        {tb(`plans.${plan.id}.name`)}
                      </h3>
                      <p className="mt-1 text-sm text-muted">
                        {tb(`plans.${plan.id}.devices`)}
                      </p>

                      <div className="mt-6 flex items-end gap-2.5">
                        <span className="font-display text-[2.5rem] font-bold leading-none tracking-tight tabular-nums text-gradient">
                          {plan.amountLabel}
                        </span>
                        {plan.compareLabel && (
                          <span className="pb-1 text-base tabular-nums text-faint line-through">
                            {plan.compareLabel}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <span className="text-faint">{tb("perpetual")}</span>
                        {plan.discount != null && (
                          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold tabular-nums text-accent">
                            {tb("save", { percent: plan.discount })}
                          </span>
                        )}
                      </div>

                      <ul className="mt-6 flex flex-col gap-3 text-left">
                        {features.map((f) => (
                          <li
                            key={f}
                            className="flex items-start gap-3 text-sm text-foreground/90"
                          >
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/12 text-accent">
                              <CheckGlyph className="h-3 w-3" />
                            </span>
                            {f}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-7 flex-1" />

                      <Link
                        href="/mac/buy"
                        className={cn(
                          "inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold",
                          recommended
                            ? "cta-aurora"
                            : "border border-white/[0.12] bg-white/[0.03] text-foreground transition-colors hover:border-white/[0.24] hover:bg-white/[0.06]",
                        )}
                      >
                        {tb("cta")}
                      </Link>
                    </div>
                  </Reveal>
                );
              })}
            </div>
            <Reveal y={12} duration={0.5} delay={0.1}>
              <ul className="mx-auto mt-10 flex max-w-2xl flex-col gap-2 sm:flex-row sm:justify-center sm:gap-8">
                {trust.map((line) => (
                  <li
                    key={line}
                    className="flex items-center justify-center gap-2 text-[13px] text-muted"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    {line}
                  </li>
                ))}
              </ul>
            </Reveal>
          </>
        ) : (
          /* prices not yet configured/active — quiet fallback card */
          <Reveal y={12} duration={0.5} className="mx-auto mt-12 max-w-lg">
            <div className="mac-card rounded-3xl p-8 text-center sm:p-10">
              <div className="font-display text-2xl font-bold tracking-tight text-gradient">
                {t("priceLabel")}
              </div>
              <p className="mt-2.5 text-sm text-faint">{t("priceNote")}</p>
              <ul className="mx-auto mt-7 flex max-w-sm flex-col gap-3 text-left">
                {(t.raw("features") as string[]).map((f) => (
                  <li key={f} className="flex items-start gap-3 text-[15px] text-foreground/90">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/12 text-accent">
                      <CheckGlyph className="h-3 w-3" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/mac/buy"
                className="cta-aurora mt-8 inline-flex w-full items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold"
              >
                {t("cta")}
              </Link>
            </div>
          </Reveal>
        )}
      </Wrap>
    </Band>
  );
}

/* ================= FAQ ================= */

export function MacFaq() {
  const t = useTranslations("mac.faq");
  const items = t.raw("items") as { q: string; a: string }[];
  return (
    <Band id="faq" className="py-20 sm:py-28">
      <Wrap>
        <BandHeading kicker={t("eyebrow")} title={t("title")} />
        <Reveal y={12} duration={0.5} className="mx-auto mt-10 max-w-3xl">
          <div className="mac-card rounded-3xl px-6 sm:px-8">
            {items.map((f) => (
              <details
                key={f.q}
                className="group border-b mac-hairline py-5 last:border-b-0"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium text-foreground transition-colors hover:text-brand sm:text-base [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                    className="shrink-0 text-faint transition-transform duration-300 group-open:rotate-45"
                  >
                    <path
                      d="M12 5v14M5 12h14"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                </summary>
                <p className="mt-3 max-w-2xl text-[14px] leading-[1.7] text-muted text-pretty">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </Reveal>
      </Wrap>
    </Band>
  );
}

/* ================= download (final CTA) ================= */

export function MacDownload() {
  const t = useTranslations("mac.download");
  const reqs = t.raw("reqs") as string[];
  return (
    <Band id="download" className="py-24 sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[24rem] w-[70vw] max-w-[720px] -translate-x-1/2 opacity-70 blur-[110px]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(124,151,242,0.16), transparent 72%)",
        }}
      />
      <Wrap className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal y={12} duration={0.5}>
            <Kicker>{t("eyebrow")}</Kicker>
          </Reveal>
          <Reveal y={12} duration={0.5} delay={0.06}>
            <BigTitle className="mt-3">{t("title")}</BigTitle>
          </Reveal>
          <Reveal y={12} duration={0.5} delay={0.12}>
            <Lede className="mx-auto mt-4 max-w-xl">{t("subtitle")}</Lede>
          </Reveal>
          <Reveal y={12} duration={0.5} delay={0.18}>
            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a
                href="/api/download/xico-clean"
                className="cta-aurora group/btn inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-3.5 text-[15px] font-semibold sm:w-auto"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className="transition-transform duration-300 group-hover/btn:translate-y-0.5">
                  <path d="M12 3v11m0 0l-4-4m4 4l4-4M4.5 20h15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t("cta")}
              </a>
              <Link
                href="/mac/buy"
                className="inline-flex w-full items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.03] px-7 py-3.5 text-[15px] font-medium text-foreground transition-colors hover:border-white/[0.2] hover:bg-white/[0.05] sm:w-auto"
              >
                {t("buy")}
              </Link>
            </div>
          </Reveal>
          <Reveal y={12} duration={0.5} delay={0.24}>
            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {reqs.map((r) => (
                <li key={r} className="flex items-center gap-1.5 text-[13px] text-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {r}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal y={12} duration={0.5} delay={0.3}>
            <p className="mx-auto mt-6 max-w-lg text-xs text-faint text-pretty">{t("trust")}</p>
          </Reveal>
        </div>
      </Wrap>
    </Band>
  );
}

/* ================= page header (subpages) ================= */

export function MacPageHeader({
  kicker,
  title,
  lede,
}: {
  kicker: string;
  title: string;
  lede?: string;
}) {
  return (
    <Band className="pt-32 pb-6 sm:pt-40 sm:pb-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[24rem]"
        style={{
          background:
            "radial-gradient(56% 70% at 50% -20%, rgba(124,151,242,0.12), transparent 70%)",
        }}
      />
      <Wrap className="relative">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal y={12} duration={0.5}>
            <Kicker>{kicker}</Kicker>
          </Reveal>
          <Reveal y={12} duration={0.5} delay={0.06}>
            <h1 className="mt-3 font-display font-bold leading-[1.08] tracking-tight text-balance text-[clamp(2rem,5vw,3.25rem)]">
              {title}
            </h1>
          </Reveal>
          {lede && (
            <Reveal y={12} duration={0.5} delay={0.12}>
              <Lede className="mx-auto mt-4 max-w-2xl">{lede}</Lede>
            </Reveal>
          )}
        </div>
      </Wrap>
    </Band>
  );
}

/* ================= deep-dive moments (features page) ================= */

export function MacDeepDive() {
  const t = useTranslations("mac.deepdive");
  const items = t.raw("items") as {
    tag: string;
    title: string;
    desc: string;
    points: string[];
  }[];
  const tones = ["base", "surface", "base", "surface"] as const;
  return (
    <>
      {items.map((it, i) => (
        <Band key={it.tag} tone={tones[i]} className="py-20 sm:py-28">
          <Wrap>
            <BandHeading kicker={it.tag} title={it.title} lede={it.desc} />

            <Reveal y={12} duration={0.5} delay={0.1} className="mx-auto mt-12 max-w-2xl">
              {i === 0 ? (
                <MacWindow
                  src="/shots-03/home-dark.png"
                  alt={it.title}
                  width={1800}
                  height={1520}
                  sizes="(max-width: 768px) 100vw, 672px"
                />
              ) : (
                <DeepDiveVisual index={i} />
              )}
            </Reveal>

            <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
              {it.points.map((p) => (
                <Reveal key={p} y={12} duration={0.5}>
                  <PointRow>{p}</PointRow>
                </Reveal>
              ))}
            </div>
          </Wrap>
        </Band>
      ))}
    </>
  );
}

/* ================= privacy — dark moment (security page) ================= */

export function MacPrivacy() {
  const t = useTranslations("mac.privacy");
  const points = t.raw("points") as string[];
  return (
    <Band id="privacy" tone="dark" className="py-24 sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[22rem] w-[80vw] max-w-[860px] -translate-x-1/2 rounded-full opacity-50 blur-[110px]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(53,222,160,0.22), transparent 70%)",
        }}
      />
      <Wrap className="relative">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal y={12} duration={0.5}>
            <Kicker tone="accent">{t("eyebrow")}</Kicker>
          </Reveal>
          <Reveal y={12} duration={0.5} delay={0.06}>
            <BigTitle className="mt-3 text-white">{t("title")}</BigTitle>
          </Reveal>
          <Reveal y={12} duration={0.5} delay={0.12}>
            <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-[1.65] text-white/65 text-pretty">
              {t("subtitle")}
            </p>
          </Reveal>
        </div>
        <div className="mx-auto mt-12 flex max-w-3xl flex-wrap justify-center gap-3">
          {points.map((p, i) => (
            <Reveal key={p} y={12} duration={0.5} delay={i * 0.06}>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.04] px-4 py-2.5 text-sm text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <CheckGlyph className="h-3.5 w-3.5 text-accent" />
                {p}
              </span>
            </Reveal>
          ))}
        </div>
      </Wrap>
    </Band>
  );
}

/* ================= performance (features page) ================= */

export function MacPerformance() {
  const t = useTranslations("mac.performance");
  const items = t.raw("items") as { value: string; label: string }[];
  return (
    <Band className="py-20 sm:py-28">
      <Wrap>
        <BandHeading kicker={t("eyebrow")} title={t("title")} lede={t("subtitle")} />
        <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {items.map((p, i) => (
            <Reveal key={p.label} y={12} duration={0.5} delay={i * 0.06} className="text-center">
              <div className="font-display text-xl font-bold tracking-tight tabular-nums text-foreground sm:text-2xl">
                {p.value}
              </div>
              <div className="mx-auto mt-2 max-w-[20ch] text-[13px] leading-relaxed text-muted">
                {p.label}
              </div>
            </Reveal>
          ))}
        </div>
      </Wrap>
    </Band>
  );
}

/* ================= monitor moment (features page) ================= */

export function MacMonitor() {
  const t = useTranslations("mac.monitor");
  const points = t.raw("points") as string[];
  return (
    <Band tone="surface" className="py-20 sm:py-28">
      <Wrap>
        <BandHeading kicker={t("eyebrow")} title={t("title")} lede={t("desc")} />

        <Reveal y={12} duration={0.5} delay={0.1} className="mx-auto mt-12 max-w-3xl">
          <MacWindow
            src="/mac/shots/monitor.jpg"
            alt={t("caption")}
            width={1400}
            height={1025}
            caption={t("caption")}
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </Reveal>

        <Reveal y={12} duration={0.5} delay={0.12} className="mx-auto mt-8 max-w-2xl">
          <div className="flex items-start justify-center gap-4">
            <MenuShot src="/mac/shots/menu-cpu.jpg" />
            <MenuShot src="/mac/shots/menu-temp.jpg" />
            <MenuShot src="/mac/shots/menu-disk.jpg" />
          </div>
          <p className="mt-3 text-center text-xs text-faint">{t("menuCaption")}</p>
        </Reveal>

        <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
          {points.map((p) => (
            <Reveal key={p} y={12} duration={0.5}>
              <PointRow>{p}</PointRow>
            </Reveal>
          ))}
        </div>
      </Wrap>
    </Band>
  );
}

function MenuShot({ src }: { src: string }) {
  return (
    <div className="w-1/3 max-w-[190px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0f15] shadow-[0_20px_50px_-24px_rgba(0,0,0,0.7)]">
      <Image
        src={src}
        alt="Xico Clean menu bar panel"
        width={500}
        height={980}
        sizes="190px"
        className="block h-auto w-full"
      />
    </div>
  );
}

/* ================= hardware moment (features page) ================= */

export function MacHardware() {
  const t = useTranslations("mac.hardware");
  const points = t.raw("points") as string[];
  return (
    <Band className="py-20 sm:py-28">
      <Wrap>
        <BandHeading kicker={t("eyebrow")} title={t("title")} lede={t("desc")} />
        <Reveal y={12} duration={0.5} delay={0.1} className="mx-auto mt-12 max-w-3xl">
          <MacWindow
            theme="light"
            src="/mac/shots/hardware.jpg"
            alt={t("caption")}
            width={1500}
            height={1098}
            caption={t("caption")}
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </Reveal>
        <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
          {points.map((p) => (
            <Reveal key={p} y={12} duration={0.5}>
              <PointRow>{p}</PointRow>
            </Reveal>
          ))}
        </div>
      </Wrap>
    </Band>
  );
}

/* ================= disk speed (features page) ================= */

export function MacSpeed() {
  const t = useTranslations("mac.speed");
  const points = t.raw("points") as string[];
  return (
    <Band tone="surface" className="py-20 sm:py-28">
      <Wrap>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal y={12} duration={0.5} delay={0.1} className="order-2 lg:order-1">
            <MacWindow
              src="/mac/shots/diskbench.jpg"
              alt={t("caption")}
              width={1400}
              height={933}
              caption={t("caption")}
              sizes="(max-width: 1024px) 100vw, 544px"
            />
          </Reveal>
          <div className="order-1 lg:order-2">
            <Reveal y={12} duration={0.5}>
              <Kicker>{t("eyebrow")}</Kicker>
            </Reveal>
            <Reveal y={12} duration={0.5} delay={0.06}>
              <BigTitle className="mt-3">{t("title")}</BigTitle>
            </Reveal>
            <Reveal y={12} duration={0.5} delay={0.12}>
              <Lede className="mt-4">{t("desc")}</Lede>
            </Reveal>
            <div className="mt-7 space-y-3.5">
              {points.map((p) => (
                <Reveal key={p} y={12} duration={0.5}>
                  <PointRow>{p}</PointRow>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </Wrap>
    </Band>
  );
}

/* ================= screenshot showcase (features page) ================= */

const SHOWCASE: { src: string; w: number; h: number; key: string }[] = [
  { src: "/mac/shots/systemjunk.jpg", w: 1400, h: 933, key: "systemjunk" },
  { src: "/mac/shots/uninstaller.jpg", w: 1400, h: 933, key: "uninstaller" },
  { src: "/mac/shots/duplicates.jpg", w: 1400, h: 933, key: "duplicates" },
  { src: "/mac/shots/optimization.jpg", w: 1400, h: 933, key: "optimization" },
];

export function MacShowcase() {
  const t = useTranslations("mac.showcase");
  const ts = useTranslations("mac.shots");
  return (
    <Band className="py-20 sm:py-28">
      <Wrap>
        <BandHeading kicker={t("eyebrow")} title={t("title")} lede={t("lede")} />
        <div className="mt-12 grid gap-6 sm:gap-8 md:grid-cols-2">
          {SHOWCASE.map((s, i) => (
            <Reveal key={s.key} y={12} duration={0.5} delay={(i % 2) * 0.08}>
              <MacWindow
                src={s.src}
                alt={ts(s.key)}
                width={s.w}
                height={s.h}
                caption={ts(s.key)}
                sizes="(max-width: 768px) 100vw, 544px"
              />
            </Reveal>
          ))}
        </div>
      </Wrap>
    </Band>
  );
}

/* ================= full feature catalog (features page) ================= */

export function MacCatalog() {
  const t = useTranslations("mac.catalog");
  const groups = t.raw("groups") as {
    name: string;
    items: { name: string; desc: string }[];
  }[];
  return (
    <Band tone="surface" className="py-20 sm:py-28">
      <Wrap>
        <BandHeading
          kicker={t("eyebrow")}
          title={t("title")}
          lede={t("subtitle")}
        />
        <div className="mt-14 flex flex-col gap-14">
          {groups.map((g, gi) => (
            <div key={g.name}>
              <Reveal y={12} duration={0.5}>
                <div className="flex items-center gap-3">
                  <span className="font-display text-sm font-semibold tabular-nums text-brand">
                    {String(gi + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
                    {g.name}
                  </h3>
                  <span className="h-px flex-1 bg-white/[0.06]" />
                </div>
              </Reveal>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map((it, i) => (
                  <Reveal key={it.name} y={12} duration={0.5} delay={(i % 3) * 0.05}>
                    <div className="mac-card mac-lift h-full rounded-2xl p-5">
                      <div className="text-[15px] font-semibold text-foreground">
                        {it.name}
                      </div>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                        {it.desc}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Wrap>
    </Band>
  );
}

/* ================= all-in-one matrix (pricing page) ================= */

export function MacAllInOne() {
  const t = useTranslations("mac.allinone");
  const rows = t.raw("rows") as { label: string; ref: string }[];
  return (
    <Band className="py-20 sm:py-28">
      <Wrap>
        <BandHeading kicker={t("eyebrow")} title={t("title")} lede={t("desc")} />

        <Reveal y={12} duration={0.5} delay={0.1} className="mx-auto mt-12 max-w-3xl">
          <div className="mac-card overflow-hidden rounded-3xl">
            <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b mac-hairline px-5 py-4 text-xs font-medium uppercase tracking-wide text-faint sm:px-8">
              <span />
              <span className="w-24 text-center sm:w-36">{t("appsLabel")}</span>
              <span className="w-24 rounded-full bg-brand/12 px-3 py-1.5 text-center font-semibold normal-case tracking-normal text-brand sm:w-28">
                {t("colOurs")}
              </span>
            </div>
            {rows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b mac-hairline px-5 py-4 last:border-b-0 sm:px-8"
              >
                <span className="text-sm font-medium text-foreground">{row.label}</span>
                <span className="w-24 text-center text-[13px] text-faint sm:w-36">{row.ref}</span>
                <span className="flex w-24 items-center justify-center sm:w-28">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/15 text-accent">
                    <CheckGlyph className="h-3.5 w-3.5" />
                  </span>
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-faint">{t("footNote")}</p>
        </Reveal>
      </Wrap>
    </Band>
  );
}

/* ================= pricing comparison (pricing page) ================= */

export function MacCompare() {
  const t = useTranslations("mac.compare");
  const rows = t.raw("rows") as { label: string; ours: string; theirs: string }[];
  return (
    <Band tone="surface" className="py-20 sm:py-28">
      <Wrap>
        <BandHeading kicker={t("eyebrow")} title={t("title")} />
        <Reveal y={12} duration={0.5} delay={0.1} className="mx-auto mt-10 max-w-2xl">
          <div className="mac-card overflow-hidden rounded-3xl">
            <div className="grid grid-cols-[1.1fr_1fr_1fr] text-sm">
              <div className="p-4" />
              <div className="bg-brand/10 p-4 text-center font-display font-semibold text-brand">
                {t("oursLabel")}
              </div>
              <div className="p-4 text-center font-medium text-muted">
                {t("theirsLabel")}
              </div>
              {rows.map((r) => (
                <Fragment key={r.label}>
                  <div className="border-t mac-hairline p-4 text-muted">
                    {r.label}
                  </div>
                  <div className="flex items-center justify-center gap-1.5 border-t mac-hairline bg-brand/[0.05] p-4 text-center font-medium text-foreground">
                    <CheckGlyph className="h-3.5 w-3.5 shrink-0 text-accent" />
                    {r.ours}
                  </div>
                  <div className="border-t mac-hairline p-4 text-center text-faint">
                    {r.theirs}
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        </Reveal>
      </Wrap>
    </Band>
  );
}

/* ================= support ================= */

export function MacSupport() {
  const t = useTranslations("mac.support");
  const reqs = t.raw("requirements") as string[];
  return (
    <Band tone="surface" className="py-20 sm:py-28">
      <Wrap>
        <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-2">
          <Reveal y={12} duration={0.5}>
            <h3 className="font-display text-xl font-semibold text-foreground">
              {t("requirementsTitle")}
            </h3>
            <ul className="mt-6 flex flex-col gap-3.5">
              {reqs.map((r) => (
                <li key={r} className="flex items-start gap-3 text-[15px] text-muted">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/12 text-accent">
                    <CheckGlyph className="h-3 w-3" />
                  </span>
                  {r}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal y={12} duration={0.5} delay={0.08}>
            <div className="mac-card rounded-3xl p-8">
              <h3 className="font-display text-xl font-semibold text-foreground">
                {t("contactTitle")}
              </h3>
              <p className="mt-3 leading-relaxed text-muted">{t("contactDesc")}</p>
              <a
                href={`mailto:${site.email}`}
                className="cta-aurora mt-6 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold"
              >
                {t("contactCta")}
              </a>
              <div className="mt-4 text-sm text-faint">{site.email}</div>
            </div>
          </Reveal>
        </div>
      </Wrap>
    </Band>
  );
}

/* ================= waitlist / updates (support page) ================= */

export function MacWaitlist() {
  const t = useTranslations("mac.waitlist");
  return (
    <Band id="waitlist" className="py-24 sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/4 h-[20rem] w-[70vw] max-w-[720px] -translate-x-1/2 rounded-full opacity-60 blur-[110px]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(124,151,242,0.14), transparent 70%)",
        }}
      />
      <Wrap className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal y={12} duration={0.5}>
            <Kicker tone="accent">{t("eyebrow")}</Kicker>
          </Reveal>
          <Reveal y={12} duration={0.5} delay={0.06}>
            <BigTitle className="mt-3">{t("title")}</BigTitle>
          </Reveal>
          <Reveal y={12} duration={0.5} delay={0.12}>
            <Lede className="mx-auto mt-4 max-w-xl">{t("subtitle")}</Lede>
          </Reveal>
          <Reveal y={12} duration={0.5} delay={0.18} className="mt-10">
            <div className="mx-auto max-w-xl">
              <WaitlistForm source="waitlist" />
            </div>
          </Reveal>
        </div>
      </Wrap>
    </Band>
  );
}
