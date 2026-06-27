import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations, useLocale } from "next-intl";
import { Mark, wordmarkFor } from "@/components/brand/logo";
import { PageHero } from "@/components/page-hero";
import { Container, Eyebrow } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { SpotlightTracker } from "@/components/ui/spotlight-tracker";
import { ButtonLink, ArrowIcon } from "@/components/ui/button";
import { site } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("about") };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AboutContent />;
}

function AboutContent() {
  const t = useTranslations("about");
  const tc = useTranslations("contact");
  const tcta = useTranslations("cta");
  const locale = useLocale();
  const story = t.raw("story") as string[];
  const values = t.raw("values.items") as { title: string; desc: string }[];
  const founderBio = t.raw("founder.bio") as string[];
  const company = t.raw("company") as Record<string, string>;

  return (
    <>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <section className="pb-24 sm:pb-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
            <Reveal className="lg:sticky lg:top-28 lg:h-fit">
              <div className="interactive-surface rounded-3xl border border-border bg-surface/40 p-6 sm:p-8">
                <div
                  aria-hidden
                  className="relative mb-6 grid h-40 place-items-center overflow-hidden rounded-2xl border border-border/60"
                  style={{
                    background:
                      "radial-gradient(120% 120% at 0% 0%, rgba(124,140,255,0.32), transparent 55%), radial-gradient(120% 120% at 100% 100%, rgba(94,231,208,0.24), transparent 55%)",
                  }}
                >
                  <div className="absolute inset-0 bg-grid opacity-50" />
                  <Mark
                    size={54}
                    className="relative [filter:drop-shadow(0_6px_20px_rgba(124,140,255,0.4))]"
                  />
                </div>
                <p className="font-display text-xl font-semibold text-foreground">
                  {wordmarkFor(locale)}
                </p>
                <p className="mt-2 text-sm text-muted">
                  {t("subtitle")}
                </p>
              </div>
            </Reveal>

            <div className="flex flex-col gap-6">
              {story.map((para, i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <p className="text-lg leading-relaxed text-muted/90">{para}</p>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="mt-24">
            <Reveal>
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                {t("values.title")}
              </h2>
            </Reveal>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {values.map((v, i) => (
                <Reveal key={v.title} delay={i * 0.07}>
                  <div className="group spotlight-card interactive-surface card-elevated h-full overflow-hidden rounded-2xl border border-border bg-surface/60 p-6">
                    <SpotlightTracker />
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-brand/10 text-brand transition-colors duration-300 group-hover:border-brand/30 group-hover:bg-brand/15">
                      <ValueIcon index={i} />
                    </div>
                    <h3 className="mt-5 font-display font-semibold text-foreground">
                      {v.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {v.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="mt-16">
            <Reveal>
              <div className="interactive-surface rounded-3xl border border-border bg-surface/40 p-8 sm:p-10">
                <div className="text-xs font-medium uppercase tracking-wider text-faint">
                  {company.eyebrow}
                </div>
                <dl className="mt-6 grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    [company.companyLabel, company.company],
                    [company.brandLabel, company.brand],
                    [company.focusLabel, company.focus],
                    [company.marketsLabel, company.markets],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs uppercase tracking-wider text-faint">
                        {label}
                      </dt>
                      <dd className="mt-1.5 text-sm leading-relaxed text-foreground">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="border-t border-border py-24 sm:py-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <Reveal className="lg:sticky lg:top-28 lg:h-fit">
              <Eyebrow>{t("founder.eyebrow")}</Eyebrow>
              <blockquote className="mt-6 font-display text-2xl font-semibold leading-snug tracking-tight text-balance sm:text-3xl">
                “{t("founder.quote")}" 
              </blockquote>
              <div className="mt-7 flex items-center gap-3">
                <span
                  aria-hidden
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border bg-surface ring-1 ring-brand/15"
                >
                  <Mark size={22} />
                </span>
                <div>
                  <div className="font-medium text-foreground">
                    {t("founder.name")}
                  </div>
                  <div className="text-sm text-muted">{t("founder.role")}</div>
                </div>
              </div>
            </Reveal>
            <div className="flex flex-col gap-5">
              {founderBio.map((p, i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <p className="text-lg leading-relaxed text-muted/90 text-pretty">
                    {p}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-24 sm:pb-32">
        <Container>
          <Reveal>
            <div className="spotlight-card interactive-surface card-elevated border-gradient relative overflow-hidden rounded-[2rem] border border-border bg-surface/60 px-6 py-12 sm:px-14 sm:py-16">
              <SpotlightTracker />
              <div
                aria-hidden
                className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-70 blur-[90px]"
                style={{
                  background:
                    "radial-gradient(closest-side, color-mix(in oklab, var(--brand) 32%, transparent), transparent 70%)",
                }}
              />
              <div className="relative z-[2] grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:items-center">
                <div>
                  <Eyebrow>{tc("eyebrow")}</Eyebrow>
                  <h2 className="mt-5 font-display text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
                    {tc("title")}
                  </h2>
                  <p className="mt-4 max-w-md leading-relaxed text-muted">
                    {tc("subtitle")}
                  </p>
                  <div className="mt-8 flex flex-wrap gap-x-12 gap-y-4">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-faint">
                        {tc("direct.emailLabel")}
                      </div>
                      <a
                        href={`mailto:${site.email}`}
                        className="mt-1 block text-foreground transition-colors hover:text-accent"
                      >
                        {site.email}
                      </a>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-faint">
                        {tc("direct.locationLabel")}
                      </div>
                      <div className="mt-1 text-foreground">
                        {tc("direct.location")}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full lg:w-auto lg:justify-self-end">
                  <ButtonLink href="/contact" variant="primary" className="w-full sm:w-auto">
                    {tcta("button")}
                    <ArrowIcon />
                  </ButtonLink>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}

function ValueIcon({ index }: { index: number }) {
  const paths = [
    // 审美即竞争力 — sparkle
    "M12 3c.6 4.8 2.6 6.8 7 7-4.4.2-6.4 2.2-7 7-.6-4.8-2.6-6.8-7-7 4.4-.2 6.4-2.2 7-7z",
    // 用 AI 创造杠杆 — bolt
    "M13 2.5 5 13.5h5l-1 8 8-11.5h-5l1-7.5z",
    // 长期主义 — clock
    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2",
    // 全球化基因 — globe
    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3.5 9.5h17M3.5 14.5h17M12 3c2.4 2.5 3.6 5.6 3.6 9s-1.2 6.5-3.6 9c-2.4-2.5-3.6-5.6-3.6-9s1.2-6.5 3.6-9z",
  ];
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={paths[index % paths.length]}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
