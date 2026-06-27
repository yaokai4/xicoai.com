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
    <section className="relative pt-32 pb-12 sm:pt-48 sm:pb-20">
      <Container>
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="mt-6 max-w-4xl font-display text-[2.35rem] font-semibold leading-[1.06] tracking-tight text-balance max-[380px]:text-[2rem] sm:text-6xl">
            {title}
          </h1>
        </Reveal>
        {subtitle && (
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              {subtitle}
            </p>
          </Reveal>
        )}
      </Container>
    </section>
  );
}
