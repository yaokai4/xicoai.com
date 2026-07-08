import "server-only";

/**
 * Thin client for the Stalwart mail server's management API — this is how
 * /admin/mail/users creates real IMAP/SMTP mailboxes (xxx@xicoai.com usable
 * from QQ Mail / Gmail / Apple Mail / Outlook). The API lives on the internal
 * docker network only; auth is the fallback-admin account.
 *
 * Principal model (v0.11+): { type: "individual", name: "kevin@xicoai.com",
 * secrets: [...], emails: ["kevin@xicoai.com", ...aliases], quota, description }.
 * A catch-all is an alias literally named "@domain".
 */

const BASE = process.env.STALWART_API_URL || "http://stalwart:8080";

function authHeader(): string {
  const secret = process.env.STALWART_ADMIN_SECRET;
  if (!secret) throw new Error("STALWART_ADMIN_SECRET is not set.");
  return `Basic ${Buffer.from(`admin:${secret}`).toString("base64")}`;
}

async function api<T>(
  path: string,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  const { json, ...rest } = init ?? {};
  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: {
      authorization: authHeader(),
      ...(json !== undefined ? { "content-type": "application/json" } : {}),
      ...(rest.headers ?? {}),
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`stalwart ${path} → ${res.status}: ${text.slice(0, 300)}`);
  }
  const parsed = text ? JSON.parse(text) : {};
  // Management API wraps results as { data: ... }
  return (parsed && typeof parsed === "object" && "data" in parsed
    ? (parsed as { data: T }).data
    : (parsed as T));
}

export type MailPrincipal = {
  id?: number;
  type: string;
  name: string;
  emails?: string[];
  quota?: number;
  description?: string;
  usedQuota?: number;
};

export function mailDomain(): string {
  return process.env.MAIL_PRIMARY_DOMAIN || "xicoai.com";
}

export function stalwartConfigured(): boolean {
  return Boolean(process.env.STALWART_ADMIN_SECRET);
}

/** All individual accounts (mailboxes). */
export async function listMailUsers(): Promise<MailPrincipal[]> {
  const result = await api<{ items?: MailPrincipal[] }>(
    `/api/principal?types=individual&fields=name,emails,quota,description,usedQuota&limit=500`,
  );
  return result.items ?? [];
}

export async function getMailUser(name: string): Promise<MailPrincipal> {
  return api<MailPrincipal>(`/api/principal/${encodeURIComponent(name)}`);
}

/** Create a mailbox. `name` must be the full address (login = full address). */
export async function createMailUser(opts: {
  name: string;
  password: string;
  displayName?: string | null;
  quotaBytes?: number;
  aliases?: string[];
}): Promise<void> {
  await api(`/api/principal`, {
    method: "POST",
    json: {
      type: "individual",
      name: opts.name,
      secrets: [opts.password],
      emails: [opts.name, ...(opts.aliases ?? [])],
      description: opts.displayName || undefined,
      quota: opts.quotaBytes ?? 2 * 1024 * 1024 * 1024,
      roles: ["user"],
    },
  });
}

/** PATCH helper for principal fields (Stalwart update-list format). */
async function patchPrincipal(
  name: string,
  updates: { action: "set" | "addItem" | "removeItem"; field: string; value: unknown }[],
): Promise<void> {
  await api(`/api/principal/${encodeURIComponent(name)}`, {
    method: "PATCH",
    json: updates,
  });
}

export async function setMailUserPassword(
  name: string,
  password: string,
): Promise<void> {
  await patchPrincipal(name, [
    { action: "set", field: "secrets", value: [password] },
  ]);
}

export async function setMailUserAliases(
  name: string,
  aliases: string[],
): Promise<void> {
  await patchPrincipal(name, [
    { action: "set", field: "emails", value: [name, ...aliases] },
  ]);
}

export async function deleteMailUser(name: string): Promise<void> {
  await api(`/api/principal/${encodeURIComponent(name)}`, { method: "DELETE" });
}

/* ── domain & DKIM (setup-time helpers) ────────────────────── */

export async function ensureDomain(domain: string): Promise<void> {
  try {
    await api(`/api/domain/${encodeURIComponent(domain)}`, { method: "POST" });
  } catch (e) {
    // Already exists → fine.
    if (!String(e).includes("exists") && !String(e).includes("409")) throw e;
  }
}

/** DNS records Stalwart wants for the domain (MX/DKIM/SPF suggestions). */
export async function dnsRecords(
  domain: string,
): Promise<{ type: string; name: string; content: string }[]> {
  return api(`/api/dns/records/${encodeURIComponent(domain)}`);
}
