import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { PageHero } from "@/components/page-hero";
import { Container } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { SpotlightTracker } from "@/components/ui/spotlight-tracker";
import { CTA } from "@/components/sections/cta";
import { pageAlternates } from "@/lib/i18n-meta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: { absolute: t("servicesTitle") },
    description: t("servicesDescription"),
    alternates: pageAlternates("/services", locale),
  };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ServicesContent />;
}

type Service = { title: string; desc: string; points: string[] };

function ServicesContent() {
  const t = useTranslations("services");
  const sections = t.raw("sections") as Service[];

  return (
    <>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <section className="pb-24 sm:pb-32">
        <Container>
          <div className="flex flex-col gap-4">
            {sections.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.06}>
                <article className="spotlight-card group interactive-surface card-elevated grid gap-8 overflow-hidden rounded-[1.5rem] border border-border bg-surface/60 p-6 sm:rounded-3xl sm:p-10 lg:grid-cols-[0.8fr_1.2fr]">
                  <SpotlightTracker />
                  <div className="relative z-[2]">
                    <span className="font-display text-sm font-semibold text-brand">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                      {s.title}
                    </h2>
                    <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
                      {s.desc}
                    </p>
                  </div>
                  <ul className="relative z-[2] grid gap-3 sm:grid-cols-2 lg:border-l lg:border-border lg:pl-10">
                    {s.points.map((p) => (
                      <li
                        key={p}
                        className="flex items-start gap-3 text-sm text-muted/90"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <CTA />
    </>
  );
}
