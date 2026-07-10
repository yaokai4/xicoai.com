import { cn } from "@/lib/utils";

const FEATURE_PATHS = [
  // 0 smart scan — sparkle
  "M12 3c.6 4.8 2.6 6.8 7 7-4.4.2-6.4 2.2-7 7-.6-4.8-2.6-6.8-7-7 4.4-.2 6.4-2.2 7-7z",
  // 1 system junk — trash
  "M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13M10 11v6M14 11v6",
  // 2 developer junk — code brackets
  "M8 7l-4 5 4 5M16 7l4 5-4 5M13.5 5l-3 14",
  // 3 space lens — treemap
  "M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z",
  // 4 large & old files — document
  "M7 3h7l5 5v13H7zM14 3v5h5",
  // 5 duplicates — copy
  "M9 9h11v11H9zM5 15V4h11",
  // 6 similar photos — image
  "M4 5h16v14H4zM4 16l5-4 4 3 3-2 4 3M9 10a1.6 1.6 0 100-3.2 1.6 1.6 0 000 3.2z",
  // 7 uninstaller — app remove
  "M5 5h14v14H5zM9 12h6",
  // 8 privacy — lock
  "M6 10V8a6 6 0 1112 0v2M5 10h14v10H5zM12 14v3",
  // 9 optimize & maintain — gear
  "M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v3M12 19v3M2 12h3M19 12h3M5.2 5.2l2.1 2.1M16.7 16.7l2.1 2.1M18.8 5.2l-2.1 2.1M7.3 16.7l-2.1 2.1",
  // 10 menu bar monitor — activity
  "M3 12h4l3 8 4-16 3 8h4",
  // 11 malware removal — shield
  "M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6zM9.5 12l1.8 1.8L15 10",
  // 12 collection basket — basket
  "M4 9h16l-1.6 10H5.6zM8 9l2.5-5M16 9l-2.5-5M9.5 13v3M14.5 13v3",
  // 13 explainable health score — pulse in circle
  "M12 21a9 9 0 100-18 9 9 0 000 18zM6.5 12h3l1.5-3.5 2 7 1.5-3.5h3",
  // 14 free up iCloud copies — cloud with down arrow
  "M7 17a4 4 0 01-.6-7.95A5.5 5.5 0 0117.4 8.6 3.7 3.7 0 0117 16M12 11v9m0 0l-3-3m3 3l3-3",
  // 15 threshold alerts — bell
  "M6 17h12v-1.2L16.5 13V9.5a4.5 4.5 0 10-9 0V13L6 15.8zM10 20a2 2 0 004 0",
];

const SAFETY_PATHS = [
  // 0 preview before delete — eye
  "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7zM12 15a3 3 0 100-6 3 3 0 000 6z",
  // 1 undoable — undo arrow
  "M9 14l-4-4 4-4M5 10h9a5 5 0 015 5v1",
  // 2 whitelist — list with check
  "M4 6h9M4 12h9M4 18h6M15 15l2 2 4-4",
  // 3 protection list — shield
  "M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z",
  // 4 safe by default — checkbox
  "M5 5h10v10H5zM8 10l2 2 4-4",
  // 5 transparent — info
  "M12 21a9 9 0 100-18 9 9 0 000 18zM12 11v5M12 7.5h.01",
];

export function FeatureGlyph({
  index,
  className,
}: {
  index: number;
  className?: string;
}) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={cn("shrink-0", className)}
    >
      <path
        d={FEATURE_PATHS[index % FEATURE_PATHS.length]}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SafetyGlyph({
  index,
  className,
}: {
  index: number;
  className?: string;
}) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={cn("shrink-0", className)}
    >
      <path
        d={SAFETY_PATHS[index % SAFETY_PATHS.length]}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckGlyph({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={cn("shrink-0", className)}
    >
      <path
        d="M5 12.5 10 17.5 19 6.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
