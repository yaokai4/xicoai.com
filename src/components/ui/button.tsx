import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "group/btn inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-foreground px-5 py-3 text-bg shadow-[0_2px_10px_-2px_rgba(20,18,50,0.25)] hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-10px_color-mix(in_oklab,var(--brand)_60%,transparent)] active:translate-y-0 active:scale-[0.97]",
  secondary:
    "glass px-5 py-3 text-foreground hover:-translate-y-0.5 hover:border-border-strong hover:bg-white/[0.07] active:translate-y-0 active:scale-[0.97]",
  ghost:
    "px-5 py-3 text-muted hover:text-foreground active:scale-[0.97]",
};

export function buttonClass(variant: Variant = "primary", className?: string) {
  return cn(base, variants[variant], className);
}

export function ButtonLink({
  href,
  variant = "primary",
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={buttonClass(variant, className)}>
      {children}
    </Link>
  );
}

export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={cn(
        "transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-x-0.5",
        className,
      )}
    >
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
