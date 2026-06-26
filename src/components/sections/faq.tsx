import { useTranslations } from "next-intl";
import { Container, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

type QA = { q: string; a: string };

export function Faq() {
  const t = useTranslations("faq");
  const items = t.raw("items") as QA[];

  return (
    <section className="relative border-t border-border py-24 sm:py-32">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={t("title")}
            subtitle={t("subtitle")}
            className="lg:sticky lg:top-28 lg:h-fit"
          />

          <div className="flex flex-col gap-3">
            {items.map((item, i) => (
              <Reveal key={item.q} delay={i * 0.05}>
                <details className="group rounded-2xl border border-border bg-surface/50 px-6 transition-colors duration-300 hover:border-border-strong open:border-border-strong open:bg-surface">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-display text-base font-medium text-foreground [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span
                      aria-hidden
                      className="relative h-4 w-4 shrink-0 text-muted transition-transform duration-300 group-open:rotate-45"
                    >
                      <span className="absolute left-1/2 top-1/2 h-px w-3.5 -translate-x-1/2 -translate-y-1/2 bg-current" />
                      <span className="absolute left-1/2 top-1/2 h-3.5 w-px -translate-x-1/2 -translate-y-1/2 bg-current" />
                    </span>
                  </summary>
                  <p className="pb-5 text-sm leading-relaxed text-muted text-pretty">
                    {item.a}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
