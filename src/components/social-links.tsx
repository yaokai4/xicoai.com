import { SOCIAL_PLATFORMS } from "@/lib/social";
import { cn } from "@/lib/utils";

/** Footer social icons — renders only platforms that have a link set. */
export function SocialLinks({
  links,
  className,
}: {
  links: Record<string, string>;
  className?: string;
}) {
  const active = SOCIAL_PLATFORMS.filter((p) => links[p.key]);
  if (active.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {active.map((p) => (
        <a
          key={p.key}
          href={links[p.key]}
          target="_blank"
          rel="noreferrer"
          aria-label={p.label}
          title={p.label}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface hover:text-foreground"
        >
          <svg
            width="17"
            height="17"
            viewBox={p.viewBox}
            fill="currentColor"
            aria-hidden
          >
            <path d={p.d} />
          </svg>
        </a>
      ))}
    </div>
  );
}
