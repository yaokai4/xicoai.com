import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations, useLocale } from "next-intl";
import { wordmarkFor } from "@/components/brand/logo";
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
              <div className="rounded-3xl border border-border bg-surface/40 p-8">
                <div
                  aria-hidden
                  className="mb-6 h-40 rounded-2xl"
                  style={{
                    background:
                      "radial-gradient(120% 120% at 0% 0%, rgba(124,140,255,0.35), transparent 55%), radial-gradient(120% 120% at 100% 100%, rgba(94,231,208,0.28), transparent 55%)",
                  }}
                />
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
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((v, i) => (
                <Reveal key={v.title} delay={i * 0.07}>
                  <div className="spotlight-card card-elevated h-full overflow-hidden rounded-2xl border border-border bg-surface/60 p-6 transition-all duration-500 hover:-translate-y-0.5 hover:border-border-strong">
                    <SpotlightTracker />
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand to-violet" />
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
        </Container>
      </section>

      <section className="border-t border-border py-24 sm:py-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <Reveal className="lg:sticky lg:top-28 lg:h-fit">
              <Eyebrow>{t("founder.eyebrow")}</Eyebrow>
              <blockquote className="mt-6 font-display text-2xl font-semibold leading-snug tracking-tight text-balance sm:text-3xl">
                “{t("founder.quote")}”
              </blockquote>
              <div className="mt-7 flex items-center gap-3">
                <span
                  aria-hidden
                  className="h-11 w-11 rounded-full bg-gradient-to-br from-brand via-violet to-accent"
                />
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
            <div className="spotlight-card card-elevated border-gradient relative overflow-hidden rounded-[2rem] border border-border bg-surface/60 px-8 py-14 sm:px-14 sm:py-16">
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
                <div className="lg:justify-self-end">
                  <ButtonLink href="/contact" variant="primary">
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
