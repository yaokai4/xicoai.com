import { useTranslations } from "next-intl";

export function Marquee() {
  const t = useTranslations("marquee");
  const items = t.raw("items") as string[];
  const loop = [...items, ...items];

  return (
    <section className="relative border-y border-border py-6">
      <div
        className="flex overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
        }}
      >
        <div className="flex shrink-0 animate-marquee items-center gap-10 pr-10">
          {loop.map((word, i) => (
            <span
              key={i}
              className="flex items-center gap-10 whitespace-nowrap text-lg font-medium text-muted/80"
            >
              {word}
              <Dot />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Dot() {
  return <span className="h-1.5 w-1.5 rounded-full bg-brand/60" aria-hidden />;
}
