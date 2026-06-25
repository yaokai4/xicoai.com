import { cn } from "@/lib/utils";

export function Logo({
  className,
  withWordmark = true,
}: {
  className?: string;
  withWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        width="30"
        height="30"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="xico-mark" x1="4" y1="4" x2="28" y2="28">
            <stop stopColor="#7C8CFF" />
            <stop offset="0.5" stopColor="#B07CFF" />
            <stop offset="1" stopColor="#5EE7D0" />
          </linearGradient>
        </defs>
        <rect
          x="1"
          y="1"
          width="30"
          height="30"
          rx="9"
          fill="#0e1118"
          stroke="url(#xico-mark)"
          strokeOpacity="0.5"
          strokeWidth="1"
        />
        <path
          d="M10.5 10.5 L21.5 21.5 M21.5 10.5 L10.5 21.5"
          stroke="url(#xico-mark)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
      {withWordmark && (
        <span className="font-display text-[1.05rem] font-semibold tracking-tight text-foreground">
          XICO
        </span>
      )}
    </span>
  );
}
