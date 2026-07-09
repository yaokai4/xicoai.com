"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { EmailListItem } from "@/lib/webmail/jmap";
import { deleteAction, toggleFlagAction } from "@/app/webmail/_actions";

function fmtDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  const sameYear = d.getFullYear() === now.getFullYear();
  return sameYear
    ? `${d.getMonth() + 1}月${d.getDate()}日`
    : `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

function partyLabel(item: EmailListItem, isDrafts: boolean): string {
  const list = isDrafts ? item.to : item.from;
  if (!list.length) return "(无)";
  const first = list[0];
  const label = first.name || first.email;
  return list.length > 1 ? `${label} 等 ${list.length} 人` : label;
}

export function MailList({
  items,
  folderId,
  trashId,
  inTrash,
  isDrafts,
}: {
  items: EmailListItem[];
  folderId: string;
  trashId: string;
  inTrash: boolean;
  isDrafts: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function open(id: string) {
    router.push(`/webmail/message/${id}?folder=${folderId}`);
  }

  function flag(e: React.MouseEvent, id: string, on: boolean) {
    e.stopPropagation();
    startTransition(async () => {
      await toggleFlagAction(id, on);
      router.refresh();
    });
  }

  function del(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    startTransition(async () => {
      await deleteAction(id, inTrash);
      router.refresh();
    });
  }

  if (!items.length) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-faint">
        这个文件夹是空的
      </div>
    );
  }

  return (
    <ul className="flex-1 overflow-y-auto">
      {items.map((m) => (
        <li
          key={m.id}
          onClick={() => open(m.id)}
          className={`group flex cursor-pointer items-center gap-3 border-b border-border/50 px-6 py-3 transition-colors hover:bg-white/[0.03] ${
            m.seen ? "" : "bg-brand/[0.04]"
          }`}
        >
          <button
            type="button"
            onClick={(e) => flag(e, m.id, !m.flagged)}
            disabled={pending}
            className={`shrink-0 text-sm ${m.flagged ? "text-amber-400" : "text-faint opacity-0 group-hover:opacity-100"}`}
            title={m.flagged ? "取消星标" : "加星标"}
          >
            ★
          </button>
          <span
            className={`w-40 shrink-0 truncate text-sm ${m.seen ? "text-muted" : "font-semibold text-foreground"}`}
          >
            {partyLabel(m, isDrafts)}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm">
            <span className={m.seen ? "text-muted" : "font-medium text-foreground"}>
              {m.subject}
            </span>
            <span className="ml-2 text-faint">{m.preview}</span>
          </span>
          {m.hasAttachment && <span className="shrink-0 text-xs text-faint">📎</span>}
          <span className="w-16 shrink-0 text-right text-xs text-faint">
            {fmtDate(m.receivedAt)}
          </span>
          <button
            type="button"
            onClick={(e) => del(e, m.id)}
            disabled={pending}
            className="shrink-0 text-xs text-faint opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
            title={inTrash ? "彻底删除" : "删除"}
          >
            🗑
          </button>
        </li>
      ))}
    </ul>
  );
}
