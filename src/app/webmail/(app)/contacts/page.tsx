import { requireWebmail } from "@/app/webmail/_lib";
import { listContacts } from "@/lib/webmail/jmap";
import { ContactsPanel } from "./_panel";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const { cred, session } = await requireWebmail();
  const contacts = await listContacts(cred, session);
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-3.5">
        <h1 className="text-base font-semibold text-foreground">通讯录</h1>
        <span className="text-xs text-faint">{contacts.length} 位联系人</span>
      </header>
      <ContactsPanel contacts={contacts} />
    </div>
  );
}
