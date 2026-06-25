"use client";

import { useRef } from "react";

export function StatusSelect({
  action,
  id,
  status,
  options,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: number;
  status: string;
  options: { value: string; label: string }[];
}) {
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form ref={ref} action={action}>
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={status}
        onChange={() => ref.current?.requestSubmit()}
        className="rounded-lg border border-border bg-white/[0.02] px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-brand/60"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </form>
  );
}
