"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteAction } from "@/app/webmail/_actions";

export function MessageActions({
  id,
  inTrash,
  replyTo,
  replySubject,
  messageId,
}: {
  id: string;
  inTrash: boolean;
  replyTo: string;
  replySubject: string;
  messageId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const replyHref = `/webmail/compose?to=${encodeURIComponent(replyTo)}&subject=${encodeURIComponent(
    replySubject.startsWith("Re:") ? replySubject : `Re: ${replySubject}`,
  )}&inReplyTo=${encodeURIComponent(messageId)}`;

  const forwardHref = `/webmail/compose?subject=${encodeURIComponent(
    replySubject.startsWith("Fwd:") ? replySubject : `Fwd: ${replySubject}`,
  )}`;

  function del() {
    startTransition(async () => {
      await deleteAction(id, inTrash);
      router.push("/webmail");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <a
        href={replyHref}
        className="rounded-lg border border-border px-3 py-1.5 text-muted transition-colors hover:text-foreground"
      >
        回复
      </a>
      <a
        href={forwardHref}
        className="rounded-lg border border-border px-3 py-1.5 text-muted transition-colors hover:text-foreground"
      >
        转发
      </a>
      <button
        type="button"
        onClick={del}
        disabled={pending}
        className="rounded-lg border border-border px-3 py-1.5 text-red-400/80 transition-colors hover:text-red-400 disabled:opacity-50"
      >
        {inTrash ? "彻底删除" : "删除"}
      </button>
    </div>
  );
}
