"use client";

import { useState } from "react";
import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Contact } from "@/lib/webmail/jmap";
import {
  saveContactAction,
  deleteContactAction,
  type ContactState,
} from "@/app/webmail/_actions";

const field =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-brand";

export function ContactsPanel({ contacts }: { contacts: Contact[] }) {
  const [editing, setEditing] = useState<Contact | null>(null);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const q = query.trim().toLowerCase();
  const filtered = q
    ? contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.emails.some((e) => e.toLowerCase().includes(q)),
      )
    : contacts;

  function remove(id: string) {
    if (!confirm("确认删除该联系人？")) return;
    startTransition(async () => {
      await deleteContactAction(id);
      router.refresh();
    });
  }

  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex w-96 shrink-0 flex-col border-r border-border">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索联系人"
            className={field}
          />
          <button
            type="button"
            onClick={() => {
              setCreating(true);
              setEditing(null);
            }}
            className="shrink-0 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white"
          >
            新建
          </button>
        </div>
        <ul className="flex-1 overflow-y-auto">
          {filtered.map((c) => (
            <li
              key={c.id}
              onClick={() => {
                setEditing(c);
                setCreating(false);
              }}
              className={`cursor-pointer border-b border-border/50 px-4 py-3 transition-colors hover:bg-white/[0.03] ${
                editing?.id === c.id ? "bg-brand/[0.06]" : ""
              }`}
            >
              <p className="text-sm font-medium text-foreground">{c.name}</p>
              <p className="truncate text-xs text-muted">
                {c.emails[0] ?? c.phones[0] ?? "—"}
              </p>
            </li>
          ))}
          {!filtered.length && (
            <li className="px-4 py-10 text-center text-sm text-faint">
              还没有联系人
            </li>
          )}
        </ul>
      </div>

      <div className="min-w-0 flex-1 overflow-y-auto p-6">
        {creating || editing ? (
          <ContactForm
            key={editing?.id ?? "new"}
            contact={editing}
            onDone={() => {
              setCreating(false);
              setEditing(null);
              router.refresh();
            }}
            onDelete={editing ? () => remove(editing.id) : undefined}
            pending={pending}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-faint">
            选择左侧联系人查看，或点「新建」添加
          </div>
        )}
      </div>
    </div>
  );
}

function ContactForm({
  contact,
  onDone,
  onDelete,
  pending,
}: {
  contact: Contact | null;
  onDone: () => void;
  onDelete?: () => void;
  pending: boolean;
}) {
  const [state, action, saving] = useActionState<ContactState, FormData>(
    async (prev, fd) => {
      const res = await saveContactAction(prev, fd);
      if (res.ok) onDone();
      return res;
    },
    {},
  );

  return (
    <form action={action} className="max-w-md">
      <input type="hidden" name="id" value={contact?.id ?? ""} />
      <h2 className="text-base font-semibold text-foreground">
        {contact ? "编辑联系人" : "新建联系人"}
      </h2>
      <div className="mt-5 flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-muted">姓名 *</span>
          <input name="name" defaultValue={contact?.name ?? ""} className={field} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-muted">邮箱</span>
          <input
            name="email"
            type="email"
            defaultValue={contact?.emails[0] ?? ""}
            className={field}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-muted">电话</span>
          <input name="phone" defaultValue={contact?.phones[0] ?? ""} className={field} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-muted">公司</span>
          <input name="org" defaultValue={contact?.org ?? ""} className={field} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-muted">备注</span>
          <textarea
            name="note"
            rows={3}
            defaultValue={contact?.note ?? ""}
            className={field}
          />
        </label>
      </div>
      {state.error && <p className="mt-3 text-sm text-red-500">{state.error}</p>}
      <div className="mt-5 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "保存中…" : "保存"}
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="text-sm text-red-400/80 transition-colors hover:text-red-400"
          >
            删除
          </button>
        )}
      </div>
    </form>
  );
}
