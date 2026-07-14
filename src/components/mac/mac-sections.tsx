/* eslint-disable @next/next/no-html-link-for-pages -- Download CTAs intentionally hit a file API route. */
import { Fragment } from "react";
import { useLocale, useTranslations } from "next-intl";
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
  shotDir,
} from "@/components/mac/mac-ui";
import { FeatureGlyph, SafetyGlyph, CheckGlyph } from "@/components/mac/icons";
import {
  DeepDiveVisual,
  MiniRing,
  MiniTreemap,
} from "@/components/mac/visuals";
import { WaitlistForm } from "@/components/mac/waitlist-form";
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

/* ================= stat band ================= */

export function MacStats() {
  const t = useTranslations("mac.stats");
  const items = t.raw("items") as { value: string; label: string }[];
  return (
    <Band tone="surface" className="border-y border-border/60 py-16 sm:py-20">
      <Wrap>
        <div className="grid grid-cols-2 gap-y-10 md:grid-cols-4">
          {items.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06} className="text-center">
              <div className="font-display text-4xl font-semibold tracking-tight text-gradient sm:text-5xl">
                {s.value}
              </div>
              <div className="mx-auto mt-2 max-w-[18ch] text-sm text-muted">
                {s.label}
              </div>
            </Reveal>
          ))}
        </div>
      </Wrap>
    </Band>
  );
}

/* ================= features bento ================= */

export function MacFeatures({ moreHref }: { moreHref?: string } = {}) {
  const t = useTranslations("mac.features");
  const tp = useTranslations("mac.pages");
  const items = t.raw("items") as { name: string; desc: string }[];
  return (
    <Band id="features" className="py-24 sm:py-32">
      <Wrap>
        <BandHeading
          kicker={t("eyebrow")}
          title={t("title")}
          lede={t("subtitle")}
        />
        <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 [grid-auto-flow:dense] sm:[grid-auto-rows:minmax(158px,1fr)]">
          {items.map((f, i) => (
            <BentoTile key={f.name} f={f} i={i} />
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
}: {
  f: { name: string; desc: string };
  i: number;
}) {
  const big = i === 0; // Smart Scan
  const wide = i === 3; // Space Lens
  const span = big
    ? "col-span-2 row-span-2"
    : wide
      ? "col-span-2"
      : "";
  return (
    <Reveal delay={(i % 4) * 0.05} className={cn(span)}>
      <div
        className={cn(
          "group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface p-6 transition-colors duration-300 hover:border-border-strong",
          big && "sm:p-8",
        )}
      >
        {big ? (
          <div className="mb-6 flex flex-1 items-center justify-center text-brand">
            <MiniRing />
          </div>
        ) : wide ? (
          <div className="mb-5 text-brand">
            <MiniTreemap />
          </div>
        ) : (
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-brand/10 text-brand transition-colors duration-300 group-hover:border-brand/30 group-hover:bg-brand/15">
            <FeatureGlyph index={i} />
          </div>
        )}
        <h3
          className={cn(
            "font-display font-semibold text-foreground",
            big && "text-xl",
          )}
        >
          {f.name}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{f.desc}</p>
      </div>
    </Reveal>
  );
}

/* ================= deep-dive moments ================= */

export function MacDeepDive() {
  const t = useTranslations("mac.deepdive");
  const sd = shotDir(useLocale());
  const items = t.raw("items") as {
    tag: string;
    title: string;
    desc: string;
    points: string[];
  }[];
  const tones = ["surface", "base", "surface", "base"] as const;
  return (
    <>
      {items.map((it, i) => (
        <Band key={it.tag} tone={tones[i]} className="py-24 sm:py-32">
          <Wrap>
            <div className="mx-auto max-w-3xl text-center">
              <Reveal>
                <Kicker>{it.tag}</Kicker>
              </Reveal>
              <Reveal delay={0.05}>
                <BigTitle className="mt-4">{it.title}</BigTitle>
              </Reveal>
              <Reveal delay={0.1}>
                <Lede className="mx-auto mt-5 max-w-2xl">{it.desc}</Lede>
              </Reveal>
            </div>

            <Reveal delay={0.1} className="mx-auto mt-14 max-w-2xl">
              {i === 0 ? (
                <MacWindow
                  src={`/mac/shots/${sd}/dashboard.jpg`}
                  alt="希可Mac清理 — 智能扫描"
                  width={1400}
                  height={1275}
                />
              ) : (
                <DeepDiveVisual index={i} />
              )}
            </Reveal>

            <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">
              {it.points.map((p) => (
                <Reveal key={p}>
                  <div className="flex items-start gap-2.5 text-sm text-muted">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/12 text-accent">
                      <CheckGlyph className="h-3 w-3" />
                    </span>
                    {p}
                  </div>
                </Reveal>
              ))}
            </div>
          </Wrap>
        </Band>
      ))}
    </>
  );
}

/* ================= safety ================= */

export function MacSafety({ topPad = false }: { topPad?: boolean } = {}) {
  const t = useTranslations("mac.safety");
  const items = t.raw("items") as { title: string; desc: string }[];
  return (
    <Band
      id="safety"
      tone="surface"
      className={cn("py-24 sm:py-32", topPad && "pt-32 sm:pt-40")}
    >
      <Wrap>
        <BandHeading
          kicker={t("eyebrow")}
          title={t("title")}
          lede={t("subtitle")}
        />
        <div className="mt-14 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s, i) => (
            <Reveal key={s.title} delay={(i % 3) * 0.07}>
              <div className="flex h-full flex-col">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
                  <SafetyGlyph index={i} />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-foreground">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
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

/* ================= privacy — dark moment ================= */

export function MacPrivacy() {
  const t = useTranslations("mac.privacy");
  const points = t.raw("points") as string[];
  return (
    <Band id="privacy" tone="dark" className="py-28 sm:py-40">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[60vh] w-[80vw] max-w-[900px] -translate-x-1/2 rounded-full opacity-60 blur-[120px]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(94,231,208,0.35), transparent 70%)",
        }}
      />
      <Wrap className="relative">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">
              {t("eyebrow")}
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <BigTitle className="mt-4 text-white">{t("title")}</BigTitle>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/70 text-pretty sm:text-xl">
              {t("subtitle")}
            </p>
          </Reveal>
        </div>
        <div className="mx-auto mt-14 flex max-w-3xl flex-wrap justify-center gap-3">
          {points.map((p, i) => (
            <Reveal key={p} delay={i * 0.06}>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-2.5 text-sm text-white/85 backdrop-blur-sm">
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

/* ================= performance ================= */

export function MacPerformance() {
  const t = useTranslations("mac.performance");
  const items = t.raw("items") as { value: string; label: string }[];
  return (
    <Band className="py-24 sm:py-32">
      <Wrap>
        <BandHeading kicker={t("eyebrow")} title={t("title")} lede={t("subtitle")} />
        <div className="mt-16 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
          {items.map((p, i) => (
            <Reveal key={p.label} delay={i * 0.07} className="text-center">
              <div className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
                {p.value}
              </div>
              <div className="mx-auto mt-2.5 max-w-[20ch] text-sm leading-relaxed text-muted">
                {p.label}
              </div>
            </Reveal>
          ))}
        </div>
      </Wrap>
    </Band>
  );
}

/* ================= pricing ================= */

export function MacPricing({ topPad = false }: { topPad?: boolean } = {}) {
  const t = useTranslations("mac.pricing");
  const features = t.raw("features") as string[];
  return (
    <Band
      id="pricing"
      tone="surface"
      className={cn("py-24 sm:py-32", topPad && "pt-32 sm:pt-40")}
    >
      <Wrap>
        <BandHeading kicker={t("eyebrow")} title={t("title")} lede={t("subtitle")} />
        <Reveal delay={0.1} className="mx-auto mt-14 max-w-lg">
          <div className="rounded-[2rem] border border-border bg-bg p-8 text-center sm:p-10">
            <div className="font-display text-3xl font-semibold tracking-tight text-gradient">
              {t("priceLabel")}
            </div>
            <p className="mt-2.5 text-sm text-faint">{t("priceNote")}</p>
            <ul className="mx-auto mt-8 flex max-w-sm flex-col gap-3.5 text-left">
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
            <Link
              href="/mac/buy"
              className="mt-9 inline-flex w-full items-center justify-center rounded-full bg-foreground px-6 py-3.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5"
            >
              {t("cta")}
            </Link>
          </div>
        </Reveal>
      </Wrap>
    </Band>
  );
}

/* ================= FAQ ================= */

export function MacFaq() {
  const t = useTranslations("mac.faq");
  const items = t.raw("items") as { q: string; a: string }[];
  return (
    <Band id="faq" className="py-24 sm:py-32">
      <Wrap>
        <BandHeading kicker={t("eyebrow")} title={t("title")} />
        <div className="mx-auto mt-12 max-w-3xl">
          {items.map((f) => (
            <Reveal key={f.q}>
              <details className="group border-t border-border py-5 last:border-b">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-medium text-foreground [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <svg
                    width="20"
                    height="20"
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
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted text-pretty">
                  {f.a}
                </p>
              </details>
            </Reveal>
          ))}
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
        className="pointer-events-none absolute inset-x-0 top-0 h-[50vh]"
        style={{
          background:
            "radial-gradient(120% 90% at 50% -20%, color-mix(in oklab, var(--brand) 16%, transparent), transparent 60%)",
        }}
      />
      <Wrap className="relative">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <Kicker>{kicker}</Kicker>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-4 font-display font-semibold leading-[1.05] tracking-tight text-balance text-[clamp(2rem,5vw,3.75rem)]">
              {title}
            </h1>
          </Reveal>
          {lede && (
            <Reveal delay={0.1}>
              <Lede className="mx-auto mt-5 max-w-2xl">{lede}</Lede>
            </Reveal>
          )}
        </div>
      </Wrap>
    </Band>
  );
}

/* ================= monitor moment (real screenshots) ================= */

export function MacMonitor() {
  const t = useTranslations("mac.monitor");
  const sd = shotDir(useLocale());
  const points = t.raw("points") as string[];
  return (
    <Band tone="surface" className="py-24 sm:py-32">
      <Wrap>
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <Kicker>{t("eyebrow")}</Kicker>
          </Reveal>
          <Reveal delay={0.05}>
            <BigTitle className="mt-4">{t("title")}</BigTitle>
          </Reveal>
          <Reveal delay={0.1}>
            <Lede className="mx-auto mt-5 max-w-2xl">{t("desc")}</Lede>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="mx-auto mt-14 max-w-3xl">
          <MacWindow
            src={`/mac/shots/${sd}/monitor.jpg`}
            alt="希可Mac清理 — 系统监视"
            width={1400}
            height={1025}
            caption={t("caption")}
          />
        </Reveal>

        <Reveal delay={0.12} className="mx-auto mt-8 max-w-2xl">
          <div className="flex items-start justify-center gap-4">
            <MenuShot src={`/mac/shots/${sd}/menu-cpu.jpg`} />
            <MenuShot src={`/mac/shots/${sd}/menu-temp.jpg`} />
            <MenuShot src={`/mac/shots/${sd}/menu-disk.jpg`} />
          </div>
          <p className="mt-3 text-center text-xs text-faint">{t("menuCaption")}</p>
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">
          {points.map((p) => (
            <Reveal key={p}>
              <div className="flex items-start gap-2.5 text-sm text-muted">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/12 text-accent">
                  <CheckGlyph className="h-3 w-3" />
                </span>
                {p}
              </div>
            </Reveal>
          ))}
        </div>
      </Wrap>
    </Band>
  );
}

function MenuShot({ src }: { src: string }) {
  return (
    <div className="w-1/3 max-w-[190px] overflow-hidden rounded-2xl border border-white/10 bg-[#0d0f15] shadow-[0_20px_50px_-24px_rgba(10,8,40,0.6)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="希可Mac清理 菜单栏面板"
        width={500}
        height={980}
        loading="lazy"
        decoding="async"
        className="block h-auto w-full"
      />
    </div>
  );
}

/* ================= hardware moment (real light-mode shot) ================= */

export function MacHardware() {
  const t = useTranslations("mac.hardware");
  const sd = shotDir(useLocale());
  const points = t.raw("points") as string[];
  return (
    <Band className="py-24 sm:py-32">
      <Wrap>
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <Kicker>{t("eyebrow")}</Kicker>
          </Reveal>
          <Reveal delay={0.05}>
            <BigTitle className="mt-4">{t("title")}</BigTitle>
          </Reveal>
          <Reveal delay={0.1}>
            <Lede className="mx-auto mt-5 max-w-2xl">{t("desc")}</Lede>
          </Reveal>
        </div>
        <Reveal delay={0.1} className="mx-auto mt-14 max-w-3xl">
          <MacWindow
            theme="light"
            src={`/mac/shots/${sd}/hardware.jpg`}
            alt="希可Mac清理 — 硬件与健康"
            width={1500}
            height={1098}
            caption={t("caption")}
          />
        </Reveal>
        <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">
          {points.map((p) => (
            <Reveal key={p}>
              <div className="flex items-start gap-2.5 text-sm text-muted">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/12 text-accent">
                  <CheckGlyph className="h-3 w-3" />
                </span>
                {p}
              </div>
            </Reveal>
          ))}
        </div>
      </Wrap>
    </Band>
  );
}

/* ================= full feature catalog ================= */

export function MacCatalog() {
  const t = useTranslations("mac.catalog");
  const groups = t.raw("groups") as {
    name: string;
    items: { name: string; desc: string }[];
  }[];
  return (
    <Band tone="surface" className="py-24 sm:py-32">
      <Wrap>
        <BandHeading
          kicker={t("eyebrow")}
          title={t("title")}
          lede={t("subtitle")}
        />
        <div className="mt-16 flex flex-col gap-14">
          {groups.map((g, gi) => (
            <div key={g.name}>
              <Reveal>
                <div className="flex items-center gap-3">
                  <span className="font-display text-sm font-semibold tabular-nums text-brand">
                    {String(gi + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
                    {g.name}
                  </h3>
                  <span className="h-px flex-1 bg-border" />
                </div>
              </Reveal>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map((it, i) => (
                  <Reveal key={it.name} delay={(i % 3) * 0.05}>
                    <div className="h-full rounded-2xl border border-border bg-bg p-5 transition-colors duration-300 hover:border-border-strong">
                      <div className="font-display font-semibold text-foreground">
                        {it.name}
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted">
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

/* ================= pricing comparison ================= */

export function MacCompare() {
  const t = useTranslations("mac.compare");
  const rows = t.raw("rows") as { label: string; ours: string; theirs: string }[];
  return (
    <Band className="py-24 sm:py-32">
      <Wrap>
        <BandHeading kicker={t("eyebrow")} title={t("title")} />
        <Reveal delay={0.1} className="mx-auto mt-12 max-w-2xl">
          <div className="overflow-x-auto rounded-3xl border border-border">
            <div className="grid min-w-[560px] grid-cols-[1.1fr_1fr_1fr] text-sm">
              <div className="bg-surface p-4" />
              <div className="bg-brand/10 p-4 text-center font-display font-semibold text-brand">
                {t("oursLabel")}
              </div>
              <div className="bg-surface p-4 text-center font-medium text-muted">
                {t("theirsLabel")}
              </div>
              {rows.map((r) => (
                <Fragment key={r.label}>
                  <div className="border-t border-border p-4 text-muted">
                    {r.label}
                  </div>
                  <div className="flex items-center justify-center gap-1.5 border-t border-border bg-brand/[0.05] p-4 text-center font-medium text-foreground">
                    <CheckGlyph className="h-3.5 w-3.5 shrink-0 text-accent" />
                    {r.ours}
                  </div>
                  <div className="border-t border-border p-4 text-center text-faint">
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
    <Band tone="surface" className="py-24 sm:py-32">
      <Wrap>
        <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-2">
          <Reveal>
            <h3 className="font-display text-xl font-semibold text-foreground">
              {t("requirementsTitle")}
            </h3>
            <ul className="mt-6 flex flex-col gap-3.5">
              {reqs.map((r) => (
                <li key={r} className="flex items-start gap-3 text-[15px] text-muted">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                    <CheckGlyph className="h-3 w-3" />
                  </span>
                  {r}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="rounded-3xl border border-border bg-bg p-8">
              <h3 className="font-display text-xl font-semibold text-foreground">
                {t("contactTitle")}
              </h3>
              <p className="mt-3 leading-relaxed text-muted">{t("contactDesc")}</p>
              <a
                href={`mailto:${site.email}`}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5"
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

/* ================= home teasers ================= */

export function MacPrivacyTeaser() {
  const t = useTranslations("mac.privacy");
  const tp = useTranslations("mac.pages");
  return (
    <Band tone="dark" className="py-24 sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[55vh] w-[80vw] max-w-[900px] -translate-x-1/2 rounded-full opacity-60 blur-[120px]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(94,231,208,0.32), transparent 70%)",
        }}
      />
      <Wrap className="relative">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">
              {t("eyebrow")}
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <BigTitle className="mt-4 text-white">{t("title")}</BigTitle>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/70 text-pretty">
              {t("subtitle")}
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <Link
              href="/mac/security"
              className="mt-8 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.06] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/[0.12]"
            >
              {tp("moreSecurity")}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </Reveal>
        </div>
      </Wrap>
    </Band>
  );
}

export function MacPricingTeaser() {
  const t = useTranslations("mac.pricing");
  const tp = useTranslations("mac.pages");
  return (
    <Band tone="surface" className="py-24 sm:py-32">
      <Wrap>
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <Kicker>{t("eyebrow")}</Kicker>
          </Reveal>
          <Reveal delay={0.05}>
            <BigTitle className="mt-4">{t("title")}</BigTitle>
          </Reveal>
          <Reveal delay={0.1}>
            <Lede className="mx-auto mt-5 max-w-xl">{t("subtitle")}</Lede>
          </Reveal>
          <Reveal delay={0.15} className="mt-8">
            <ArrowLink href="/mac/pricing">{tp("morePricing")}</ArrowLink>
          </Reveal>
        </div>
      </Wrap>
    </Band>
  );
}

/* ================= waitlist finale ================= */

/* ================= screenshot showcase ================= */

// 画廊改用真实白天模式新截图（智能扫描六合一中枢领衔）；旧的卸载器/优化暗色图退役。
const SHOWCASE: { name: string; w: number; h: number; key: string }[] = [
  { name: "smartscan", w: 1400, h: 855, key: "smartscan" },
  { name: "systemjunk", w: 1400, h: 933, key: "systemjunk" },
  { name: "duplicates", w: 1400, h: 933, key: "duplicates" },
  { name: "spacelens", w: 1400, h: 933, key: "spacelens" },
];

export function MacShowcase() {
  const t = useTranslations("mac.showcase");
  const ts = useTranslations("mac.shots");
  const sd = shotDir(useLocale());
  return (
    <Band tone="surface" className="py-24 sm:py-32">
      <Wrap>
        <BandHeading kicker={t("eyebrow")} title={t("title")} lede={t("lede")} />
        <div className="mt-14 grid gap-6 sm:gap-8 md:grid-cols-2">
          {SHOWCASE.map((s, i) => (
            <Reveal key={s.key} delay={(i % 2) * 0.08}>
              <MacWindow
                src={`/mac/shots/${sd}/${s.name}.jpg`}
                alt={ts(s.key)}
                width={s.w}
                height={s.h}
                caption={ts(s.key)}
              />
            </Reveal>
          ))}
        </div>
      </Wrap>
    </Band>
  );
}

/* ================= download (launched CTA) ================= */

export function MacDownload() {
  const t = useTranslations("mac.download");
  const reqs = t.raw("reqs") as string[];
  return (
    <Band id="download" tone="surface" className="py-28 sm:py-36">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/4 h-[50vh] w-[70vw] max-w-[760px] -translate-x-1/2 rounded-full opacity-60 blur-[120px]"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--brand) 26%, transparent), transparent 70%)",
        }}
      />
      <Wrap className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <Kicker>{t("eyebrow")}</Kicker>
          </Reveal>
          <Reveal delay={0.05}>
            <BigTitle className="mt-4">{t("title")}</BigTitle>
          </Reveal>
          <Reveal delay={0.1}>
            <Lede className="mx-auto mt-5 max-w-xl">{t("subtitle")}</Lede>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a
                href="/api/download/xico-clean"
                className="group/btn inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-8 py-4 text-[15px] font-medium text-bg transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-12px_color-mix(in_oklab,var(--brand)_60%,transparent)] active:translate-y-0 sm:w-auto"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden className="transition-transform duration-300 group-hover/btn:translate-y-0.5">
                  <path d="M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5M4 20h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t("cta")}
              </a>
              <Link
                href="/mac/buy"
                className="inline-flex w-full items-center justify-center rounded-full px-7 py-4 text-[15px] font-medium text-brand transition-colors hover:text-brand-soft sm:w-auto"
              >
                {t("buy")}
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {reqs.map((r) => (
                <li key={r} className="flex items-center gap-1.5 text-[13px] text-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {r}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.25}>
            <p className="mx-auto mt-6 max-w-lg text-xs text-faint text-pretty">{t("trust")}</p>
          </Reveal>
        </div>
      </Wrap>
    </Band>
  );
}

export function MacWaitlist() {
  const t = useTranslations("mac.waitlist");
  return (
    <Band id="waitlist" tone="surface" className="py-28 sm:py-40">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/4 h-[50vh] w-[70vw] max-w-[760px] -translate-x-1/2 rounded-full opacity-60 blur-[120px]"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--brand) 28%, transparent), transparent 70%)",
        }}
      />
      <Wrap className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <Kicker tone="accent">{t("eyebrow")}</Kicker>
          </Reveal>
          <Reveal delay={0.05}>
            <BigTitle className="mt-4">{t("title")}</BigTitle>
          </Reveal>
          <Reveal delay={0.1}>
            <Lede className="mx-auto mt-5 max-w-xl">{t("subtitle")}</Lede>
          </Reveal>
          <Reveal delay={0.15} className="mt-10">
            <div className="mx-auto max-w-xl">
              <WaitlistForm source="waitlist" />
            </div>
          </Reveal>
        </div>
      </Wrap>
    </Band>
  );
}

/* ─── 空间透镜（左文右图分栏,打破居中节奏） ─────────────────────────── */

export function MacLens() {
  const t = useTranslations("mac.lens");
  const sd = shotDir(useLocale());
  const points = t.raw("points") as string[];
  return (
    <Band className="py-24 sm:py-32">
      <Wrap>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal>
              <Kicker>{t("eyebrow")}</Kicker>
            </Reveal>
            <Reveal delay={0.05}>
              <BigTitle className="mt-4">{t("title")}</BigTitle>
            </Reveal>
            <Reveal delay={0.1}>
              <Lede className="mt-5">{t("desc")}</Lede>
            </Reveal>
            <div className="mt-8 space-y-3.5">
              {points.map((p) => (
                <Reveal key={p}>
                  <div className="flex items-start gap-2.5 text-sm text-muted">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/12 text-accent">
                      <CheckGlyph className="h-3 w-3" />
                    </span>
                    {p}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal delay={0.1}>
            <MacWindow
              src={`/mac/shots/${sd}/spacelens.jpg`}
              alt="希可Mac清理 — 空间透镜放射环形图"
              width={1100}
              height={1145}
              caption={t("caption")}
            />
          </Reveal>
        </div>
      </Wrap>
    </Band>
  );
}

/* ─── 磁盘测速（左图右文,与空间透镜交替） ─────────────────────────── */

export function MacSpeed() {
  const t = useTranslations("mac.speed");
  const sd = shotDir(useLocale());
  const points = t.raw("points") as string[];
  return (
    <Band tone="surface" className="py-24 sm:py-32">
      <Wrap>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal delay={0.1} className="order-2 lg:order-1">
            <MacWindow
              src={`/mac/shots/${sd}/diskbench.jpg`}
              alt="希可Mac清理 — 磁盘测速双仪表"
              width={1400}
              height={933}
              caption={t("caption")}
            />
          </Reveal>
          <div className="order-1 lg:order-2">
            <Reveal>
              <Kicker>{t("eyebrow")}</Kicker>
            </Reveal>
            <Reveal delay={0.05}>
              <BigTitle className="mt-4">{t("title")}</BigTitle>
            </Reveal>
            <Reveal delay={0.1}>
              <Lede className="mt-5">{t("desc")}</Lede>
            </Reveal>
            <div className="mt-8 space-y-3.5">
              {points.map((p) => (
                <Reveal key={p}>
                  <div className="flex items-start gap-2.5 text-sm text-muted">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/12 text-accent">
                      <CheckGlyph className="h-3 w-3" />
                    </span>
                    {p}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </Wrap>
    </Band>
  );
}

/* ─── 一款替代四款（能力矩阵,核心卖点区块） ─────────────────────────── */

export function MacAllInOne() {
  const t = useTranslations("mac.allinone");
  const rows = t.raw("rows") as { label: string; ref: string }[];
  return (
    <Band className="py-24 sm:py-32">
      <Wrap>
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <Kicker>{t("eyebrow")}</Kicker>
          </Reveal>
          <Reveal delay={0.05}>
            <BigTitle className="mt-4">{t("title")}</BigTitle>
          </Reveal>
          <Reveal delay={0.1}>
            <Lede className="mx-auto mt-5 max-w-2xl">{t("desc")}</Lede>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="mx-auto mt-14 max-w-3xl">
          <div className="overflow-x-auto rounded-3xl border border-border bg-surface/60 shadow-[0_30px_80px_-40px_color-mix(in_oklab,var(--brand)_35%,transparent)]">
            {/* 表头 */}
            <div className="grid min-w-[560px] grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-border px-6 py-4 text-xs font-medium uppercase tracking-wide text-faint sm:px-8">
              <span />
              <span className="w-28 text-center sm:w-36">{t("appsLabel")}</span>
              <span className="w-24 rounded-full bg-brand/10 px-3 py-1.5 text-center font-semibold normal-case tracking-normal text-brand sm:w-28">
                {t("colOurs")}
              </span>
            </div>
            {rows.map((row) => (
              <div
                key={row.label}
                className="grid min-w-[560px] grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-border/60 px-6 py-4 last:border-b-0 sm:px-8"
              >
                <span className="text-sm font-medium text-foreground">{row.label}</span>
                <span className="w-28 text-center text-[13px] text-faint sm:w-36">{row.ref}</span>
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
