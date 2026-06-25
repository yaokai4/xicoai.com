import { useTranslations } from "next-intl";
import { Container, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

type Item = { title: string; desc: string; tags: string[] };

export function Capabilities() {
  const t = useTranslations("capabilities");
  const items = t.raw("items") as Item[];

  return (
    <section className="relative py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08}>
              <article className="group card-elevated relative h-full overflow-hidden rounded-2xl border border-border bg-surface/60 p-7 transition-all duration-500 hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <CapIcon index={i} />
                <h3 className="mt-6 font-display text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {item.desc}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border px-2.5 py-1 text-[11px] text-faint"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function CapIcon({ index }: { index: number }) {
  const paths = [
    // AI / spark
    "M12 3v4M12 17v4M3 12h4M17 12h4M7.5 7.5 5 5M16.5 7.5 19 5M7.5 16.5 5 19M16.5 16.5 19 19M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
    // design / pen
    "M4 20l4-1 9-9a2.5 2.5 0 0 0-3.5-3.5l-9 9-1 4ZM13.5 6.5l3.5 3.5",
    // code / engineering
    "M8 9l-4 3 4 3M16 9l4 3-4 3M13 5l-2 14",
    // globe / growth
    "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18",
  ];
  return (
    <span
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-white/[0.02] text-brand transition-colors duration-500 group-hover:text-accent",
      )}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d={paths[index] ?? paths[0]}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
