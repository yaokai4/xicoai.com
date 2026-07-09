"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Folder = {
  id: string;
  label: string;
  role: string | null;
  unread: number;
  total: number;
};

export function FolderNav({
  folders,
  inboxId,
}: {
  folders: Folder[];
  inboxId: string;
}) {
  const params = useSearchParams();
  const active = params.get("folder") ?? inboxId;

  return (
    <nav className="mt-4 flex flex-1 flex-col gap-0.5 overflow-y-auto px-3">
      {folders.map((f) => {
        const isActive = f.id === active;
        return (
          <Link
            key={f.id}
            href={`/webmail?folder=${f.id}`}
            className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
              isActive
                ? "bg-brand/10 font-medium text-brand"
                : "text-muted hover:bg-white/5 hover:text-foreground"
            }`}
          >
            <span className="truncate">{f.label}</span>
            {f.unread > 0 && (
              <span
                className={`ml-2 shrink-0 rounded-full px-1.5 text-[11px] font-semibold ${
                  isActive ? "bg-brand text-white" : "bg-brand/80 text-white"
                }`}
              >
                {f.unread}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
