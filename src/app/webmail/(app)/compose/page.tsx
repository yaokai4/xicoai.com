import { requireWebmail } from "@/app/webmail/_lib";
import { getIdentities } from "@/lib/webmail/jmap";
import { ComposeForm } from "./_form";

export const dynamic = "force-dynamic";

export default async function ComposePage({
  searchParams,
}: {
  searchParams: Promise<{
    to?: string;
    subject?: string;
    inReplyTo?: string;
    cc?: string;
  }>;
}) {
  const sp = await searchParams;
  const { cred, session } = await requireWebmail();
  const identities = await getIdentities(cred, session);
  const from =
    identities.find((i) => i.email === cred.email)?.email ??
    identities[0]?.email ??
    cred.email;

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-border px-6 py-3.5">
        <h1 className="text-base font-semibold text-foreground">写邮件</h1>
      </header>
      <ComposeForm
        from={from}
        defaultTo={sp.to ?? ""}
        defaultCc={sp.cc ?? ""}
        defaultSubject={sp.subject ?? ""}
        inReplyTo={sp.inReplyTo ?? ""}
      />
    </div>
  );
}
