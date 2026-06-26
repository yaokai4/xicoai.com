import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/page-hero";
import { Container } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { SpotlightTracker } from "@/components/ui/spotlight-tracker";
import { CTA } from "@/components/sections/cta";
import { productUrls } from "@/lib/site";
import { cn } from "@/lib/utils";

type Item = {
  key: string;
  name: string;
  kind: string;
  tagline: string;
  about: string;
  highlights: string[];
  status: string;
  platforms?: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("work") };
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "work" });
  const items = t.raw("items") as Item[];

  return (
    <>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <section className="pb-24 sm:pb-32">
        <Container>
          <div className="flex flex-col gap-5">
            {items.map((item, i) => {
              const url = productUrls[item.key];
              const domain = url?.replace(/^https?:\/\//, "");
              const muted = item.key === "next";
              return (
                <Reveal key={item.key} delay={i * 0.06}>
                  <article className="spotlight-card card-elevated relative overflow-hidden rounded-[2rem] border border-border bg-surface/60 p-8 sm:p-12">
                    <SpotlightTracker />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-60 blur-3xl"
                      style={{
                        background:
                          "radial-gradient(closest-side, color-mix(in oklab, var(--brand) 24%, transparent), transparent 70%)",
                      }}
                    />
                    <div className="relative z-[2] grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xs font-medium uppercase tracking-wider text-faint">
                            {item.kind}
                          </span>
                          <StatusBadge label={item.status} muted={muted} />
                        </div>
                        <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                          {item.name}
                        </h2>
                        {item.tagline && (
                          <p className="mt-3 font-display text-lg font-medium text-gradient sm:text-xl">
                            {item.tagline}
                          </p>
                        )}
                        <p className="mt-5 max-w-xl leading-relaxed text-muted/90 text-pretty">
                          {item.about}
                        </p>
                        {item.platforms && (
                          <div className="mt-5 flex items-center gap-2.5 text-sm">
                            <span className="text-xs font-medium uppercase tracking-wider text-faint">
                              {t("platformsLabel")}
                            </span>
                            <span className="text-foreground/80">
                              {item.platforms}
                            </span>
                          </div>
                        )}
                        {url && (
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="group/link mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-border-strong hover:text-brand"
                          >
                            {t("visit")}
                            <span className="text-muted">· {domain}</span>
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              aria-hidden
                              className="transition-transform duration-300 group-hover/link:translate-x-0.5"
                            >
                              <path
                                d="M7 17L17 7M9 7h8v8"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </a>
                        )}
                      </div>

                      {item.highlights.length > 0 && (
                        <div className="lg:border-l lg:border-border lg:pl-14">
                          <div className="text-xs font-medium uppercase tracking-wider text-faint">
                            {t("highlightsLabel")}
                          </div>
                          <ul className="mt-5 flex flex-col gap-3.5">
                            {item.highlights.map((h) => (
                              <li
                                key={h}
                                className="flex items-start gap-3 text-sm text-muted/90"
                              >
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                                {h}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      <CTA />
    </>
  );
}

function StatusBadge({ label, muted }: { label: string; muted?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px]",
        muted ? "border-border text-faint" : "border-accent/30 text-accent",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          muted ? "bg-faint" : "bg-accent shadow-[0_0_10px_var(--color-accent)]",
        )}
      />
      {label}
    </span>
  );
}
