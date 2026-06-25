import { cn } from "@/lib/utils";

/** XICO brand mark — an AI "spark / constellation" in the brand gradient. */
export function Mark({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient
          id="xico-grad"
          x1="2"
          y1="3"
          x2="30"
          y2="30"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#6E8BFF" />
          <stop offset="0.52" stopColor="#A77BFF" />
          <stop offset="1" stopColor="#4FD8C0" />
        </linearGradient>
      </defs>
      {/* primary spark */}
      <path
        d="M13 5.4 C 13.7 12.9 18 17.3 25.6 18 C 18 18.7 13.7 23.1 13 30.6 C 12.3 23.1 8 18.7 0.4 18 C 8 17.3 12.3 12.9 13 5.4 Z"
        fill="url(#xico-grad)"
      />
      {/* accent spark */}
      <path
        d="M25 2.4 C 25.3 5.4 27.1 7.2 30 7.5 C 27.1 7.8 25.3 9.6 25 12.6 C 24.7 9.6 22.9 7.8 20 7.5 C 22.9 7.2 24.7 5.4 25 2.4 Z"
        fill="url(#xico-grad)"
      />
    </svg>
  );
}

export function Logo({
  className,
  withWordmark = true,
}: {
  className?: string;
  withWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Mark size={26} />
      {withWordmark && (
        <span className="font-display text-[1.2rem] font-semibold tracking-[-0.02em] text-foreground">
          XICO
        </span>
      )}
    </span>
  );
}
