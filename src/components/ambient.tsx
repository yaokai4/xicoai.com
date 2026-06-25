/**
 * Fixed, full-bleed ambient backdrop: deep base, engineering grid,
 * and slow-drifting aurora light. Purely decorative.
 */
export function Ambient() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg"
    >
      {/* engineering grid, masked to fade near the top */}
      <div className="absolute inset-x-0 top-0 h-[140vh] bg-grid opacity-70" />

      {/* aurora blobs (theme-reactive tint) */}
      <div
        className="absolute left-1/2 top-[-18%] h-[70vh] w-[85vw] max-w-[1100px] -translate-x-1/2 rounded-full blur-[130px] animate-aurora"
        style={{
          background:
            "radial-gradient(closest-side, var(--aurora-1), transparent 70%)",
        }}
      />
      <div
        className="absolute right-[-10%] top-[8%] h-[50vh] w-[45vw] max-w-[640px] rounded-full blur-[130px] animate-aurora"
        style={{
          animationDelay: "-7s",
          background:
            "radial-gradient(closest-side, var(--aurora-2), transparent 70%)",
        }}
      />
      <div
        className="absolute left-[-8%] top-[24%] h-[44vh] w-[40vw] max-w-[560px] rounded-full blur-[130px] animate-aurora"
        style={{
          animationDelay: "-13s",
          background:
            "radial-gradient(closest-side, var(--aurora-3), transparent 70%)",
        }}
      />

      {/* bottom vignette so content always sits on deep ground */}
      <div className="absolute inset-x-0 bottom-0 h-[60vh] bg-gradient-to-t from-bg via-bg/80 to-transparent" />
    </div>
  );
}
