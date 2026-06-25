import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Eyebrow } from "@/components/ui/section";
import { ApplyForm } from "@/components/apply-form";
import { getJobBySlug } from "@/lib/jobs";
import { pickL10n, pickL10nList } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) return { title: "404" };
  return { title: pickL10n(job.title, locale) };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "careers" });
  const job = await getJobBySlug(slug);
  if (!job || job.status !== "open") notFound();

  const title = pickL10n(job.title, locale);
  const summary = pickL10n(job.summary, locale);
  const description = pickL10n(job.description, locale);
  const location = pickL10n(job.location, locale);
  const reqs = pickL10nList(job.requirements, locale);
  const paragraphs = description.split(/\n{2,}/).filter(Boolean);

  return (
    <>
      <section className="relative pt-36 pb-12 sm:pt-44">
        <Container>
          <Link
            href="/careers"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            {t("backToList")}
          </Link>
          <div className="mt-6">
            <Eyebrow>
              {t(`types.${job.employmentType}`)}
              {job.remote ? ` · ${t("remote")}` : ""}
            </Eyebrow>
          </div>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.08] tracking-tight text-balance sm:text-5xl">
            {title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            {job.team && <span>{job.team}</span>}
            {location && <span>· {location}</span>}
          </div>
          {summary && (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
              {summary}
            </p>
          )}
        </Container>
      </section>

      <section className="pb-24 sm:pb-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
            <article className="flex flex-col gap-10">
              {paragraphs.length > 0 && (
                <div>
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    {t("responsibilities")}
                  </h2>
                  <div className="mt-4 flex flex-col gap-4">
                    {paragraphs.map((p, i) => (
                      <p
                        key={i}
                        className="leading-relaxed text-muted/90 text-pretty"
                      >
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {reqs.length > 0 && (
                <div>
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    {t("requirements")}
                  </h2>
                  <ul className="mt-4 flex flex-col gap-3">
                    {reqs.map((r, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-muted/90"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>

            <aside className="lg:sticky lg:top-28 lg:h-fit">
              <div className="rounded-3xl border border-border bg-surface/40 p-7">
                <h2 className="font-display text-lg font-semibold text-foreground">
                  {t("applyTitle")}
                </h2>
                <div className="mt-6">
                  <ApplyForm jobSlug={job.slug} />
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
