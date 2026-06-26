import { useTranslations } from "next-intl";
import { Container, Eyebrow } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

export function Manifesto() {
  const t = useTranslations("manifesto");
  const body = t.raw("body") as string[];

  return (
    <section className="relative overflow-hidden py-24 sm:py-36">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-[120px]"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--brand) 18%, transparent), transparent 70%)",
        }}
      />
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <Eyebrow>{t("eyebrow")}</Eyebrow>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-6 font-display text-3xl font-semibold leading-[1.15] tracking-tight text-balance sm:text-4xl md:text-[2.9rem]">
              {t("title")}
            </h2>
          </Reveal>
          <div className="mx-auto mt-8 flex max-w-2xl flex-col gap-5">
            {body.map((p, i) => (
              <Reveal key={i} delay={0.12 + i * 0.07}>
                <p className="text-lg leading-relaxed text-muted/90 text-pretty">
                  {p}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
