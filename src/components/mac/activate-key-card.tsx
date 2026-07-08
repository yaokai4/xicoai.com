"use client";

import { useState } from "react";

export function ActivateKeyCard({
  keyText,
  copyLabel,
  copiedLabel,
}: {
  keyText: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="mt-3 rounded-2xl border border-brand/30 bg-brand/5 p-6">
      <code className="block select-all break-all font-mono text-2xl font-semibold tracking-wider text-foreground">
        {keyText}
      </code>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(keyText);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        }}
        className="mt-4 rounded-full border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-border-strong hover:text-foreground"
      >
        {copied ? copiedLabel : copyLabel}
      </button>
    </div>
  );
}
