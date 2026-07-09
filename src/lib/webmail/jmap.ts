import "server-only";

/**
 * JMAP client for the webmail BFF. Every call authenticates as the LOGGED-IN
 * END USER (their mailbox credentials), never the admin — so a user only ever
 * sees their own mail. The browser never holds these credentials; they live
 * AES-encrypted in the httpOnly session cookie and are decrypted server-side
 * per request (see session.ts). All shapes verified against Stalwart v0.16.
 *
 * Talks to Stalwart over the internal docker network (STALWART_API_URL).
 */

const BASE = process.env.STALWART_API_URL || "http://stalwart:8080";

const CAP_CORE = "urn:ietf:params:jmap:core";
const CAP_MAIL = "urn:ietf:params:jmap:mail";
const CAP_SUBMISSION = "urn:ietf:params:jmap:submission";
const CAP_CONTACTS = "urn:ietf:params:jmap:contacts";

export type Credentials = { email: string; password: string };

function authHeader(c: Credentials): string {
  return `Basic ${Buffer.from(`${c.email}:${c.password}`).toString("base64")}`;
}

export type JmapSession = {
  accountId: string;
  apiPath: string;
  downloadTemplate: string;
  uploadTemplate: string;
};

/** Fetch the JMAP session; doubles as the login credential check (401 = bad). */
export async function jmapSession(
  c: Credentials,
): Promise<JmapSession | null> {
  let res: Response;
  try {
    res = await fetch(`${BASE}/.well-known/jmap`, {
      headers: { authorization: authHeader(c) },
      cache: "no-store",
    });
  } catch {
    return null;
  }
  if (res.status === 401 || res.status === 403) return null;
  if (!res.ok) throw new Error(`jmap session ${res.status}`);
  const s = (await res.json()) as {
    accounts: Record<string, unknown>;
    apiUrl: string;
    downloadUrl: string;
    uploadUrl: string;
    primaryAccounts?: Record<string, string>;
  };
  const accountId =
    s.primaryAccounts?.[CAP_MAIL] ?? Object.keys(s.accounts ?? {})[0];
  if (!accountId) return null;
  const path = (u: string) =>
    u.startsWith("http") ? new URL(u).pathname + new URL(u).search : u;
  return {
    accountId,
    apiPath: path(s.apiUrl),
    downloadTemplate: s.downloadUrl,
    uploadTemplate: s.uploadUrl,
  };
}

type MethodCall = [string, Record<string, unknown>, string];
type MethodResponse = [string, Record<string, unknown>, string];

async function call(
  c: Credentials,
  session: JmapSession,
  using: string[],
  methodCalls: MethodCall[],
): Promise<MethodResponse[]> {
  const res = await fetch(`${BASE}${session.apiPath}`, {
    method: "POST",
    headers: { authorization: authHeader(c), "content-type": "application/json" },
    body: JSON.stringify({ using, methodCalls }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`jmap call ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const body = (await res.json()) as { methodResponses: MethodResponse[] };
  for (const r of body.methodResponses) {
    if (r[0] === "error") throw new Error(`jmap method error: ${JSON.stringify(r[1])}`);
  }
  return body.methodResponses;
}

/* ── mailboxes ─────────────────────────────────────────────── */

export type Mailbox = {
  id: string;
  name: string;
  role: string | null;
  parentId: string | null;
  totalEmails: number;
  unreadEmails: number;
  sortOrder: number;
};

export async function listMailboxes(
  c: Credentials,
  s: JmapSession,
): Promise<Mailbox[]> {
  const r = await call(c, s, [CAP_CORE, CAP_MAIL], [
    ["Mailbox/get", { accountId: s.accountId, ids: null }, "0"],
  ]);
  return (r[0][1].list as Mailbox[]).map((m) => ({
    id: m.id,
    name: m.name,
    role: m.role ?? null,
    parentId: m.parentId ?? null,
    totalEmails: m.totalEmails ?? 0,
    unreadEmails: m.unreadEmails ?? 0,
    sortOrder: m.sortOrder ?? 0,
  }));
}

/* ── email list ────────────────────────────────────────────── */

export type EmailListItem = {
  id: string;
  threadId: string;
  from: { name: string | null; email: string }[];
  to: { name: string | null; email: string }[];
  subject: string;
  preview: string;
  receivedAt: string;
  seen: boolean;
  flagged: boolean;
  hasAttachment: boolean;
  size: number;
};

const LIST_PROPS = [
  "id", "threadId", "from", "to", "subject", "preview",
  "receivedAt", "keywords", "hasAttachment", "size",
];

export async function listEmails(
  c: Credentials,
  s: JmapSession,
  opts: { mailboxId?: string; search?: string; limit?: number; position?: number },
): Promise<{ items: EmailListItem[]; total: number }> {
  const filter: Record<string, unknown> = {};
  if (opts.mailboxId) filter.inMailbox = opts.mailboxId;
  if (opts.search) filter.text = opts.search;

  const r = await call(c, s, [CAP_CORE, CAP_MAIL], [
    [
      "Email/query",
      {
        accountId: s.accountId,
        filter,
        sort: [{ property: "receivedAt", isAscending: false }],
        limit: opts.limit ?? 40,
        position: opts.position ?? 0,
        calculateTotal: true,
      },
      "0",
    ],
    [
      "Email/get",
      {
        accountId: s.accountId,
        "#ids": { resultOf: "0", name: "Email/query", path: "/ids" },
        properties: LIST_PROPS,
      },
      "1",
    ],
  ]);
  const total = (r[0][1].total as number) ?? 0;
  const list = (r[1][1].list as Array<Record<string, unknown>>) ?? [];
  // Email/get returns in arbitrary order; re-sort by the query's id order.
  const order = (r[0][1].ids as string[]) ?? [];
  const byId = new Map(list.map((e) => [e.id as string, e]));
  const items = order
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map(mapListItem);
  return { items, total };
}

function addrs(v: unknown): { name: string | null; email: string }[] {
  if (!Array.isArray(v)) return [];
  return v.map((a: Record<string, unknown>) => ({
    name: (a.name as string) || null,
    email: (a.email as string) || "",
  }));
}

function mapListItem(e: Record<string, unknown> | undefined): EmailListItem {
  const kw = (e?.keywords as Record<string, boolean>) ?? {};
  return {
    id: e!.id as string,
    threadId: (e!.threadId as string) ?? "",
    from: addrs(e!.from),
    to: addrs(e!.to),
    subject: (e!.subject as string) || "(无主题)",
    preview: (e!.preview as string) || "",
    receivedAt: (e!.receivedAt as string) || "",
    seen: Boolean(kw.$seen),
    flagged: Boolean(kw.$flagged),
    hasAttachment: Boolean(e!.hasAttachment),
    size: (e!.size as number) ?? 0,
  };
}

/* ── single email (full body) ──────────────────────────────── */

export type EmailAttachment = {
  blobId: string;
  name: string;
  type: string;
  size: number;
};

export type EmailFull = EmailListItem & {
  cc: { name: string | null; email: string }[];
  replyTo: { name: string | null; email: string }[];
  htmlBody: string | null;
  textBody: string | null;
  attachments: EmailAttachment[];
  mailboxIds: string[];
};

export async function getEmail(
  c: Credentials,
  s: JmapSession,
  id: string,
): Promise<EmailFull | null> {
  const r = await call(c, s, [CAP_CORE, CAP_MAIL], [
    [
      "Email/get",
      {
        accountId: s.accountId,
        ids: [id],
        properties: [
          ...LIST_PROPS, "cc", "replyTo", "mailboxIds",
          "bodyValues", "htmlBody", "textBody", "attachments",
        ],
        fetchHTMLBodyValues: true,
        fetchTextBodyValues: true,
        maxBodyValueBytes: 2_000_000,
      },
      "0",
    ],
  ]);
  const e = (r[0][1].list as Array<Record<string, unknown>>)?.[0];
  if (!e) return null;

  const bodyValues = (e.bodyValues as Record<string, { value: string }>) ?? {};
  const partText = (parts: unknown): string | null => {
    if (!Array.isArray(parts) || !parts.length) return null;
    return parts
      .map((p: Record<string, unknown>) => bodyValues[p.partId as string]?.value ?? "")
      .join("\n") || null;
  };
  const base = mapListItem(e);
  return {
    ...base,
    cc: addrs(e.cc),
    replyTo: addrs(e.replyTo),
    htmlBody: partText(e.htmlBody),
    textBody: partText(e.textBody),
    mailboxIds: Object.keys((e.mailboxIds as Record<string, boolean>) ?? {}),
    attachments: ((e.attachments as Array<Record<string, unknown>>) ?? []).map((a) => ({
      blobId: a.blobId as string,
      name: (a.name as string) || "附件",
      type: (a.type as string) || "application/octet-stream",
      size: (a.size as number) ?? 0,
    })),
  };
}

/* ── mutations: seen / flag / move / delete ────────────────── */

async function patchEmail(
  c: Credentials,
  s: JmapSession,
  id: string,
  patch: Record<string, unknown>,
): Promise<void> {
  await call(c, s, [CAP_CORE, CAP_MAIL], [
    ["Email/set", { accountId: s.accountId, update: { [id]: patch } }, "0"],
  ]);
}

export function setSeen(c: Credentials, s: JmapSession, id: string, seen: boolean) {
  return patchEmail(c, s, id, { "keywords/$seen": seen ? true : null });
}
export function setFlagged(c: Credentials, s: JmapSession, id: string, on: boolean) {
  return patchEmail(c, s, id, { "keywords/$flagged": on ? true : null });
}

/** Move to a single target mailbox (replaces mailbox membership). */
export function moveEmail(
  c: Credentials,
  s: JmapSession,
  id: string,
  mailboxId: string,
) {
  return patchEmail(c, s, id, { mailboxIds: { [mailboxId]: true } });
}

/** Move to trash, or destroy permanently when already in trash. */
export async function trashOrDelete(
  c: Credentials,
  s: JmapSession,
  id: string,
  trashMailboxId: string,
  inTrash: boolean,
): Promise<void> {
  if (inTrash) {
    await call(c, s, [CAP_CORE, CAP_MAIL], [
      ["Email/set", { accountId: s.accountId, destroy: [id] }, "0"],
    ]);
  } else {
    await moveEmail(c, s, id, trashMailboxId);
  }
}

/* ── send ──────────────────────────────────────────────────── */

export type SendInput = {
  identityId: string;
  from: { name: string | null; email: string };
  to: { name?: string | null; email: string }[];
  cc?: { name?: string | null; email: string }[];
  subject: string;
  text: string;
  inReplyTo?: string | null;
  sentMailboxId: string;
  drafts?: boolean;
};

export async function getIdentities(
  c: Credentials,
  s: JmapSession,
): Promise<{ id: string; name: string; email: string }[]> {
  const r = await call(c, s, [CAP_CORE, CAP_SUBMISSION], [
    ["Identity/get", { accountId: s.accountId, ids: null }, "0"],
  ]);
  return ((r[0][1].list as Array<Record<string, unknown>>) ?? []).map((i) => ({
    id: i.id as string,
    name: (i.name as string) || "",
    email: i.email as string,
  }));
}

/** Create the email object then submit it (or just save to Drafts). */
export async function sendEmail(
  c: Credentials,
  s: JmapSession,
  input: SendInput,
): Promise<void> {
  const emailObj: Record<string, unknown> = {
    mailboxIds: { [input.sentMailboxId]: true },
    keywords: { $seen: true, ...(input.drafts ? { $draft: true } : {}) },
    from: [{ name: input.from.name || undefined, email: input.from.email }],
    to: input.to.map((t) => ({ name: t.name || undefined, email: t.email })),
    ...(input.cc?.length
      ? { cc: input.cc.map((t) => ({ name: t.name || undefined, email: t.email })) }
      : {}),
    subject: input.subject,
    ...(input.inReplyTo ? { inReplyTo: [input.inReplyTo] } : {}),
    bodyStructure: { type: "text/plain", partId: "body" },
    bodyValues: { body: { value: input.text } },
  };

  if (input.drafts) {
    await call(c, s, [CAP_CORE, CAP_MAIL], [
      ["Email/set", { accountId: s.accountId, create: { draft: emailObj } }, "0"],
    ]);
    return;
  }

  await call(c, s, [CAP_CORE, CAP_MAIL, CAP_SUBMISSION], [
    ["Email/set", { accountId: s.accountId, create: { msg: emailObj } }, "0"],
    [
      "EmailSubmission/set",
      {
        accountId: s.accountId,
        onSuccessUpdateEmail: {
          "#msg": { "keywords/$draft": null },
        },
        create: {
          sub: {
            emailId: "#msg",
            identityId: input.identityId,
            envelope: {
              mailFrom: { email: input.from.email },
              rcptTo: [
                ...input.to.map((t) => ({ email: t.email })),
                ...(input.cc ?? []).map((t) => ({ email: t.email })),
              ],
            },
          },
        },
      },
      "1",
    ],
  ]);
}

/* ── attachments ───────────────────────────────────────────── */

export function downloadUrl(
  s: JmapSession,
  blobId: string,
  name: string,
  type: string,
): string {
  return s.downloadTemplate
    .replace("{accountId}", encodeURIComponent(s.accountId))
    .replace("{blobId}", encodeURIComponent(blobId))
    .replace("{type}", encodeURIComponent(type))
    .replace("{name}", encodeURIComponent(name));
}

/** Fetch an attachment's bytes (BFF streams it to the browser). */
export async function fetchBlob(
  c: Credentials,
  s: JmapSession,
  blobId: string,
  name: string,
  type: string,
): Promise<{ bytes: ArrayBuffer; type: string } | null> {
  const url = downloadUrl(s, blobId, name, type);
  const abs = url.startsWith("http") ? url : `${BASE}${url}`;
  const res = await fetch(abs, {
    headers: { authorization: authHeader(c) },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return { bytes: await res.arrayBuffer(), type };
}

/* ── contacts (JMAP ContactCard / AddressBook) ─────────────── */

export type Contact = {
  id: string;
  name: string;
  emails: string[];
  phones: string[];
  org: string | null;
  note: string | null;
};

async function primaryAddressBookId(
  c: Credentials,
  s: JmapSession,
): Promise<string | null> {
  const r = await call(c, s, [CAP_CORE, CAP_CONTACTS], [
    ["AddressBook/get", { accountId: s.accountId, ids: null, properties: ["id", "role"] }, "0"],
  ]);
  const list = (r[0][1].list as Array<{ id: string; role?: string }>) ?? [];
  if (!list.length) return null;
  return (list.find((b) => b.role === "default") ?? list[0]).id;
}

function mapContact(card: Record<string, unknown>): Contact {
  const nameObj = card.name as Record<string, unknown> | undefined;
  const full =
    (card.fullName as string) ||
    (nameObj?.full as string) ||
    ((nameObj?.components as Array<{ value: string }>)?.map((x) => x.value).join(" ")) ||
    "";
  const emails = Object.values((card.emails as Record<string, { address?: string }>) ?? {})
    .map((e) => e.address || "")
    .filter(Boolean);
  const phones = Object.values((card.phones as Record<string, { number?: string }>) ?? {})
    .map((p) => p.number || "")
    .filter(Boolean);
  const orgs = Object.values((card.organizations as Record<string, { name?: string }>) ?? {})
    .map((o) => o.name || "")
    .filter(Boolean);
  const notes = Object.values((card.notes as Record<string, { note?: string }>) ?? {})
    .map((n) => n.note || "")
    .filter(Boolean);
  return {
    id: card.id as string,
    name: full || emails[0] || "(未命名)",
    emails,
    phones,
    org: orgs[0] || null,
    note: notes[0] || null,
  };
}

export async function listContacts(
  c: Credentials,
  s: JmapSession,
): Promise<Contact[]> {
  const r = await call(c, s, [CAP_CORE, CAP_CONTACTS], [
    ["ContactCard/query", { accountId: s.accountId }, "0"],
    [
      "ContactCard/get",
      { accountId: s.accountId, "#ids": { resultOf: "0", name: "ContactCard/query", path: "/ids" } },
      "1",
    ],
  ]);
  return ((r[1][1].list as Array<Record<string, unknown>>) ?? []).map(mapContact).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export type ContactInput = {
  name: string;
  email?: string;
  phone?: string;
  org?: string;
  note?: string;
};

function contactCard(input: ContactInput): Record<string, unknown> {
  const card: Record<string, unknown> = {
    "@type": "Card",
    version: "1.0",
    kind: "individual",
    name: { full: input.name },
  };
  if (input.email) card.emails = { e1: { address: input.email } };
  if (input.phone) card.phones = { p1: { number: input.phone } };
  if (input.org) card.organizations = { o1: { name: input.org } };
  if (input.note) card.notes = { n1: { note: input.note } };
  return card;
}

export async function createContact(
  c: Credentials,
  s: JmapSession,
  input: ContactInput,
): Promise<void> {
  const bookId = await primaryAddressBookId(c, s);
  const card = contactCard(input);
  if (bookId) card.addressBookIds = { [bookId]: true };
  await call(c, s, [CAP_CORE, CAP_CONTACTS], [
    ["ContactCard/set", { accountId: s.accountId, create: { c1: card } }, "0"],
  ]);
}

export async function updateContact(
  c: Credentials,
  s: JmapSession,
  id: string,
  input: ContactInput,
): Promise<void> {
  // Replace the mutable fields wholesale (simplest correct patch).
  await call(c, s, [CAP_CORE, CAP_CONTACTS], [
    [
      "ContactCard/set",
      {
        accountId: s.accountId,
        update: {
          [id]: {
            name: { full: input.name },
            emails: input.email ? { e1: { address: input.email } } : null,
            phones: input.phone ? { p1: { number: input.phone } } : null,
            organizations: input.org ? { o1: { name: input.org } } : null,
            notes: input.note ? { n1: { note: input.note } } : null,
          },
        },
      },
      "0",
    ],
  ]);
}

export async function deleteContact(
  c: Credentials,
  s: JmapSession,
  id: string,
): Promise<void> {
  await call(c, s, [CAP_CORE, CAP_CONTACTS], [
    ["ContactCard/set", { accountId: s.accountId, destroy: [id] }, "0"],
  ]);
}
