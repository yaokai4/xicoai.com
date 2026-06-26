import { SOCIAL_PLATFORMS } from "@/lib/social";
import { cn } from "@/lib/utils";

/**
 * Footer social icons in their real brand colors. Renders only platforms
 * that have a link set. Platforms whose brand color is black (X, TikTok)
 * use the theme foreground so they stay visible in dark mode.
 */
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
      {active.map((p) => {
        const isBlack = p.color.toLowerCase() === "#000000";
        const sns = isBlack ? "var(--color-foreground)" : p.color;
        return (
          <a
            key={p.key}
            href={links[p.key]}
            target="_blank"
            rel="noreferrer"
            aria-label={p.label}
            title={p.label}
            style={{ ["--sns" as string]: sns }}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-[color:var(--sns)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-[color:var(--sns)] hover:bg-[color:color-mix(in_oklab,var(--sns)_12%,transparent)]"
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
        );
      })}
    </div>
  );
}
