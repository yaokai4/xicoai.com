import { useTranslations } from "next-intl";
import { Container, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

type Item = {
  key: string;
  name: string;
  kind: string;
  desc: string;
  status: string;
};

const STYLES: Record<
  string,
  { span: string; glow: string; monogram: string }
> = {
  machi: {
    span: "lg:col-span-7",
    glow: "color-mix(in oklab, var(--brand) 22%, transparent)",
    monogram: "M",
  },
  shangence: {
    span: "lg:col-span-5",
    glow: "color-mix(in oklab, var(--violet) 22%, transparent)",
    monogram: "S",
  },
  next: {
    span: "lg:col-span-12",
    glow: "color-mix(in oklab, var(--accent) 18%, transparent)",
    monogram: "→",
  },
};

export function Work() {
  const t = useTranslations("work");
  const items = t.raw("items") as Item[];

  return (
    <section id="work" className="relative scroll-mt-24 py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
        />

        <div className="mt-14 grid grid-cols-1 gap-4 lg:grid-cols-12">
          {items.map((item, i) => {
            const s = STYLES[item.key] ?? STYLES.machi;
            const isNext = item.key === "next";
            return (
              <Reveal key={item.key} delay={i * 0.1} className={s.span}>
                <article
                  className={cn(
                    "group card-elevated relative h-full overflow-hidden rounded-3xl border bg-surface/60 p-8 transition-all duration-500 sm:p-10",
                    isNext
                      ? "border-dashed border-border hover:border-border-strong"
                      : "border-border hover:border-border-strong hover:bg-surface",
                  )}
                >
                  {/* corner glow */}
                  <div
                    aria-hidden
                    className="absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: s.glow, opacity: 0.6 }}
                  />
                  {/* watermark monogram */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -bottom-6 right-2 select-none font-display text-[10rem] font-bold leading-none text-foreground/[0.04]"
                  >
                    {s.monogram}
                  </span>

                  <div className="relative flex h-full flex-col">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-medium uppercase tracking-wider text-faint">
                        {item.kind}
                      </span>
                      <StatusBadge label={item.status} muted={isNext} />
                    </div>

                    <h3
                      className={cn(
                        "mt-6 font-display font-semibold tracking-tight text-foreground",
                        isNext ? "text-2xl" : "text-3xl sm:text-4xl",
                      )}
                    >
                      {item.name}
                    </h3>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
                      {item.desc}
                    </p>

                    {!isNext && (
                      <div className="mt-8 flex items-center gap-2 text-sm text-muted transition-colors group-hover:text-foreground">
                        {t("viewLabel")}
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        >
                          <path
                            d="M5 12h14M13 6l6 6-6 6"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
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
  );
}

function StatusBadge({ label, muted }: { label: string; muted?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px]",
        muted
          ? "border-border text-faint"
          : "border-accent/30 text-accent",
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
