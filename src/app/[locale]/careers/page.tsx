import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/page-hero";
import { Container } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { CTA } from "@/components/sections/cta";
import { getOpenJobs } from "@/lib/jobs";
import { pickL10n } from "@/lib/content";
import type { Job } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("careers") };
}

export default async function CareersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "careers" });
  const jobs = await getOpenJobs();

  return (
    <>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <section className="pb-24 sm:pb-32">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              {t("openRoles")}
            </h2>
            <Link
              href="/join"
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {t("joinCta")} {t("joinCtaLink")}
            </Link>
          </div>

          {jobs.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-dashed border-border bg-surface/30 p-10 text-center">
              <p className="mx-auto max-w-md text-muted text-balance">
                {t("noRoles")}
              </p>
            </div>
          ) : (
            <div className="mt-8 flex flex-col gap-3">
              {jobs.map((job, i) => (
                <Reveal key={job.id} delay={i * 0.05}>
                  <JobRow
                    job={job}
                    locale={locale}
                    typeLabel={t(`types.${job.employmentType}`)}
                    remoteLabel={t("remote")}
                  />
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </section>

      <CTA />
    </>
  );
}

function JobRow({
  job,
  locale,
  typeLabel,
  remoteLabel,
}: {
  job: Job;
  locale: string;
  typeLabel: string;
  remoteLabel: string;
}) {
  const title = pickL10n(job.title, locale);
  const location = pickL10n(job.location, locale);
  const summary = pickL10n(job.summary, locale);

  return (
    <Link
      href={`/careers/${job.slug}`}
      className="group flex flex-col gap-4 rounded-2xl border border-border bg-surface/40 p-6 transition-all duration-300 hover:border-border-strong hover:bg-surface sm:flex-row sm:items-center sm:justify-between sm:p-7"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-xs text-faint">
          {job.team && <span>{job.team}</span>}
          {job.team && <span className="text-faint/50">·</span>}
          <span className="rounded-full border border-border px-2 py-0.5 text-muted">
            {typeLabel}
          </span>
          {job.remote && (
            <span className="rounded-full border border-accent/30 px-2 py-0.5 text-accent">
              {remoteLabel}
            </span>
          )}
          {location && <span>· {location}</span>}
        </div>
        <h3 className="mt-2 font-display text-xl font-semibold text-foreground">
          {title}
        </h3>
        {summary && (
          <p className="mt-1.5 line-clamp-1 text-sm text-muted">{summary}</p>
        )}
      </div>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-muted transition-all duration-300 group-hover:border-border-strong group-hover:text-foreground">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M5 12h14M13 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </Link>
  );
}
