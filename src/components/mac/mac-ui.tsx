import Image from "next/image";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";

type Tone = "base" | "surface" | "dark";

/* On the mac canvas the page is one continuous ink gradient; "surface" bands
   are a whisper of white between hairlines, "dark" dips a step deeper. */
const TONES: Record<Tone, string> = {
  base: "",
  surface: "bg-white/[0.015] border-y mac-hairline",
  dark: "bg-black/25 border-y mac-hairline",
};

/** A full-bleed section band on the product canvas. */
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
        "relative w-full overflow-hidden scroll-mt-20",
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

/** Section headline. */
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
        "font-display font-bold leading-[1.1] tracking-tight text-balance",
        "text-[clamp(1.9rem,4.2vw,2.5rem)]",
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
        "text-[17px] leading-[1.65] text-muted text-pretty",
        className,
      )}
    >
      {children}
    </p>
  );
}

/**
 * Wraps a real app screenshot in macOS window chrome (traffic lights +
 * title bar) with a soft drop shadow and an optional brand glow underneath.
 * Uses next/image so the layout is reserved before the shot loads (no CLS).
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
  glow = false,
  sizes,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  className?: string;
  eager?: boolean;
  theme?: "dark" | "light";
  glow?: boolean;
  sizes?: string;
}) {
  const light = theme === "light";
  return (
    <figure className={cn("group relative", className)}>
      {glow && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-8 -bottom-10 top-1/2 -z-10 blur-[80px]"
          style={{
            background:
              "linear-gradient(135deg, rgba(124,151,242,0.22), rgba(167,144,240,0.18) 55%, rgba(199,154,232,0.14))",
          }}
        />
      )}
      <div
        className={cn(
          "overflow-hidden rounded-xl border shadow-[0_2px_10px_rgba(0,0,0,0.35),0_40px_90px_-40px_rgba(0,0,0,0.7)]",
          light ? "border-black/10 bg-white" : "border-white/[0.08] bg-[#0d0f15]",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2 border-b px-4 py-2.5",
            light
              ? "border-black/[0.06] bg-[#f2f3f6]"
              : "border-white/[0.06] bg-[#141721]",
          )}
        >
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </span>
          <span
            className={cn(
              "ml-2 text-xs font-medium",
              light ? "text-black/40" : "text-white/40",
            )}
          >
            Xico Clean
          </span>
        </div>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={eager}
          sizes={sizes ?? "(max-width: 768px) 100vw, 896px"}
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
        <Reveal y={12} duration={0.5}>
          <Kicker tone={tone}>{kicker}</Kicker>
        </Reveal>
      )}
      <Reveal y={12} duration={0.5} delay={0.06}>
        <BigTitle className={cn(kicker && "mt-3")}>{title}</BigTitle>
      </Reveal>
      {lede && (
        <Reveal y={12} duration={0.5} delay={0.12}>
          <Lede className="mx-auto mt-4 max-w-2xl">{lede}</Lede>
        </Reveal>
      )}
    </div>
  );
}
