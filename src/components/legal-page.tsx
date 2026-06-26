import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/page-hero";
import { Container } from "@/components/ui/section";

type LegalData = {
  title: string;
  intro: string;
  sections: { h: string; p: string }[];
};

export async function LegalPage({
  locale,
  kind,
}: {
  locale: string;
  kind: "privacy" | "terms";
}) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "legal" });
  const data = t.raw(kind) as LegalData;

  return (
    <>
      <PageHero eyebrow={t("updated")} title={data.title} subtitle={data.intro} />
      <section className="pb-24 sm:pb-32">
        <Container className="max-w-3xl">
          <div className="flex flex-col gap-10">
            {data.sections.map((s, i) => (
              <div key={i}>
                <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
                  {s.h}
                </h2>
                <p className="mt-3 leading-relaxed text-muted/90 text-pretty">
                  {s.p}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
