export function FormSuccess({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-5 py-10 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-accent/40 bg-accent/10">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M5 12.5 10 17.5 19 6.5"
            stroke="var(--color-accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <p className="max-w-sm text-base text-foreground text-balance">{message}</p>
    </div>
  );
}
