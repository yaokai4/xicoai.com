import { cn } from "@/lib/utils";

/** Illustrative visuals for the deep-dive rows. Labels are technical proper
 *  nouns / file names, so they read the same across every locale. */
export function DeepDiveVisual({ index }: { index: number }) {
  switch (index) {
    case 0:
      return <SmartScanVisual />;
    case 1:
      return <TreemapVisual />;
    case 2:
      return <DevJunkVisual />;
    default:
      return <DupeVisual />;
  }
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-surface-2/40 p-5 sm:p-6">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="relative flex h-full flex-col">{children}</div>
    </div>
  );
}

const RING_BG =
  "conic-gradient(from 120deg, color-mix(in oklab, var(--brand) 70%, transparent), color-mix(in oklab, var(--accent) 60%, transparent) 200deg, transparent 300deg)";
const RING_MASK =
  "radial-gradient(closest-side, transparent 64%, #000 66%, #000 86%, transparent 88%)";

function SmartScanVisual() {
  return (
    <Frame>
      <div className="flex flex-1 items-center justify-center">
        <div className="relative grid h-40 w-40 place-items-center">
          <div
            className="absolute inset-0 [animation:spin_12s_linear_infinite]"
            style={{
              background: RING_BG,
              maskImage: RING_MASK,
              WebkitMaskImage: RING_MASK,
            }}
          />
          <div className="text-center">
            <div className="font-display text-3xl font-semibold text-foreground">
              11.4 GB
            </div>
            <div className="mt-0.5 text-[11px] uppercase tracking-wider text-faint">
              reclaimable
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

const TILES = [
  { label: "Xcode", cls: "col-span-3 row-span-3", tone: "brand" },
  { label: "Photos", cls: "col-span-3 row-span-2", tone: "violet" },
  { label: "Docker", cls: "col-span-2 row-span-2", tone: "accent" },
  { label: "Mail", cls: "col-span-1 row-span-2", tone: "muted" },
  { label: "node_modules", cls: "col-span-3 row-span-1", tone: "accent" },
  { label: "Caches", cls: "col-span-2 row-span-1", tone: "brand" },
  { label: "Music", cls: "col-span-1 row-span-1", tone: "muted" },
];

const TONE: Record<string, string> = {
  brand: "bg-brand/18 text-brand border-brand/25",
  violet: "bg-violet/18 text-violet border-violet/25",
  accent: "bg-accent/15 text-accent border-accent/25",
  muted: "bg-foreground/[0.05] text-muted border-border",
};

function TreemapVisual() {
  return (
    <Frame>
      <div className="grid flex-1 grid-cols-6 grid-rows-5 gap-1.5">
        {TILES.map((tile) => (
          <div
            key={tile.label}
            className={cn(
              "flex items-end overflow-hidden rounded-lg border p-2 text-[11px] font-medium",
              tile.cls,
              TONE[tile.tone],
            )}
          >
            <span className="truncate">{tile.label}</span>
          </div>
        ))}
      </div>
    </Frame>
  );
}

const DEV_ROWS = [
  { label: "Xcode / DerivedData", value: "4.2 GB", w: "96%" },
  { label: "node_modules", value: "2.6 GB", w: "62%" },
  { label: "iOS DeviceSupport", value: "1.8 GB", w: "42%" },
  { label: "Homebrew / npm cache", value: "980 MB", w: "24%" },
  { label: "Docker dangling", value: "610 MB", w: "15%" },
];

function DevJunkVisual() {
  return (
    <Frame>
      <div className="flex flex-1 flex-col justify-center gap-3.5">
        {DEV_ROWS.map((row) => (
          <div key={row.label} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-mono text-muted">{row.label}</span>
              <span className="tabular-nums text-foreground">{row.value}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-border/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand to-accent"
                style={{ width: row.w }}
              />
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

/* ---- compact visuals for the bento grid ---- */

export function MiniRing({ amount = "11.4 GB" }: { amount?: string }) {
  return (
    <div className="relative grid h-28 w-28 place-items-center">
      <div
        className="absolute inset-0 [animation:spin_16s_linear_infinite]"
        style={{
          background: RING_BG,
          maskImage: RING_MASK,
          WebkitMaskImage: RING_MASK,
        }}
      />
      <span className="font-display text-lg font-semibold text-current">
        {amount}
      </span>
    </div>
  );
}

const MINI_TILES = [
  { cls: "col-span-3 row-span-2", tone: "brand" },
  { cls: "col-span-2 row-span-2", tone: "violet" },
  { cls: "col-span-1 row-span-2", tone: "accent" },
  { cls: "col-span-2 row-span-1", tone: "accent" },
  { cls: "col-span-2 row-span-1", tone: "muted" },
  { cls: "col-span-2 row-span-1", tone: "brand" },
];

export function MiniTreemap() {
  return (
    <div className="grid h-full min-h-[120px] w-full grid-cols-6 grid-rows-2 gap-1.5">
      {MINI_TILES.map((t, i) => (
        <div key={i} className={cn("rounded-md border", t.cls, TONE[t.tone])} />
      ))}
    </div>
  );
}

function DupeVisual() {
  // 3×3 grid; the "keep" tile is highlighted, the rest are marked as dupes.
  const keep = 4;
  return (
    <Frame>
      <div className="grid flex-1 grid-cols-3 grid-rows-3 gap-2">
        {Array.from({ length: 9 }).map((_, i) => {
          const isKeep = i === keep;
          return (
            <div
              key={i}
              className={cn(
                "relative overflow-hidden rounded-lg border",
                isKeep
                  ? "border-accent/60 ring-2 ring-accent/30"
                  : "border-border opacity-55",
              )}
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in oklab, var(--brand) 22%, transparent), color-mix(in oklab, var(--violet) 18%, transparent))",
              }}
            >
              {isKeep && (
                <span className="absolute bottom-1 right-1 rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-semibold text-[#04150f]">
                  KEEP
                </span>
              )}
              {!isKeep && (
                <span className="absolute inset-0 grid place-items-center text-foreground/40">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 6l12 12M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Frame>
  );
}
