import { Container, Eyebrow } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

export function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative pt-40 pb-14 sm:pt-48 sm:pb-20">
      <Container>
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="mt-6 max-w-4xl font-display text-4xl font-semibold leading-[1.06] tracking-tight text-balance sm:text-6xl">
            {title}
          </h1>
        </Reveal>
        {subtitle && (
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
              {subtitle}
            </p>
          </Reveal>
        )}
      </Container>
    </section>
  );
}
