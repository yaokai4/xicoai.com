import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";

type Tone = "base" | "surface" | "dark";

const TONES: Record<Tone, string> = {
  base: "bg-bg text-foreground",
  surface: "bg-surface text-foreground",
  // Fixed cinematic dark — reads as a dramatic dark "moment" in light mode and
  // blends seamlessly in dark mode. Always light text.
  dark: "bg-[#050609] text-white",
};

/** A full-bleed, opaque section band (Apple-style stacked page). */
export function Band({
  tone = "base",
  id,
  className,
  children,
}: {
  tone?: Tone;
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative w-full overflow-hidden scroll-mt-16",
        TONES[tone],
        className,
      )}
    >
      {children}
    </section>
  );
}

export function Wrap({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

/** Small colored label above a headline. */
export function Kicker({
  children,
  className,
  tone = "brand",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "brand" | "accent" | "muted";
}) {
  const c =
    tone === "accent"
      ? "text-accent"
      : tone === "muted"
        ? "text-faint"
        : "text-brand";
  return (
    <p
      className={cn(
        "text-[13px] font-semibold uppercase tracking-[0.14em]",
        c,
        className,
      )}
    >
      {children}
    </p>
  );
}

/** Huge centered display headline (the Apple product-page voice). */
export function BigTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "font-display font-semibold leading-[1.05] tracking-tight text-balance",
        "text-[clamp(2rem,5vw,3.75rem)]",
        className,
      )}
    >
      {children}
    </h2>
  );
}

/** Supporting line under a big title. */
export function Lede({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-lg leading-relaxed text-muted text-pretty sm:text-xl",
        className,
      )}
    >
      {children}
    </p>
  );
}

/**
 * Wraps a real app screenshot in a fixed-dark macOS window chrome (traffic
 * lights + title bar), so the dark-mode app render reads as a real window in
 * both light and dark site themes.
 */
export function MacWindow({
  src,
  alt,
  width,
  height,
  caption,
  className,
  eager = false,
  theme = "dark",
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  className?: string;
  eager?: boolean;
  theme?: "dark" | "light";
}) {
  const light = theme === "light";
  return (
    <figure className={cn("group", className)}>
      <div
        className={cn(
          "overflow-hidden rounded-2xl border shadow-[0_2px_8px_rgba(0,0,0,0.18),0_30px_70px_-30px_rgba(10,8,40,0.5)]",
          light ? "border-black/10 bg-white" : "border-white/10 bg-[#0d0f15]",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2 border-b px-4 py-3",
            light
              ? "border-black/[0.06] bg-[#f2f3f6]"
              : "border-white/[0.06] bg-[#15181f]",
          )}
        >
          <span className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </span>
          <span
            className={cn(
              "ml-2 text-xs font-medium",
              light ? "text-black/40" : "text-white/45",
            )}
          >
            Xico Clean
          </span>
        </div>
        {/* real, pre-optimized screenshot rendered from the actual app */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          decoding="async"
          className="block h-auto w-full"
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-xs text-faint">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/** Centered heading block used at the top of most bands. */
export function BandHeading({
  kicker,
  title,
  lede,
  tone,
  className,
}: {
  kicker?: string;
  title: string;
  lede?: string;
  tone?: "brand" | "accent" | "muted";
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-3xl text-center", className)}>
      {kicker && (
        <Reveal>
          <Kicker tone={tone}>{kicker}</Kicker>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <BigTitle className={cn(kicker && "mt-4")}>{title}</BigTitle>
      </Reveal>
      {lede && (
        <Reveal delay={0.1}>
          <Lede className="mx-auto mt-5 max-w-2xl">{lede}</Lede>
        </Reveal>
      )}
    </div>
  );
}
