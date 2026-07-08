import "server-only";

/**
 * Client for the Stalwart mail server's registry JMAP API — this is how
 * /admin/mail/users creates real IMAP/SMTP mailboxes (xxx@xicoai.com usable
 * from QQ Mail / Gmail / Apple Mail / Outlook). The API lives on the internal
 * docker network only; auth is the fallback-admin (STALWART_ADMIN_SECRET).
 *
 * All shapes below were verified against the live server (v0.16.12):
 *  - registry objects are addressed as `x:Account`, `x:Domain`, … and called
 *    via JMAP methods `x:Account/get|set|query`;
 *  - multi-variant objects use a `@type` discriminator ("User", "Password");
 *  - object-list fields (credentials, aliases) are INDEXED MAPS: {"0": {...}};
 *  - a user's `name` is the LOCAL PART only; `emailAddress` is server-computed
 *    from name + the account's domain.
 */

const BASE = process.env.STALWART_API_URL || "http://stalwart:8080";
// The fallback-admin's fixed JMAP account id (its registry namespace).
const PRIMARY = "d333333";
const USING = [
  "urn:ietf:params:jmap:core",
  "urn:stalwart:jmap",
  "urn:ietf:params:jmap:principals",
];

function authHeader(): string {
  const secret = process.env.STALWART_ADMIN_SECRET;
  if (!secret) throw new Error("STALWART_ADMIN_SECRET is not set.");
  return `Basic ${Buffer.from(`admin:${secret}`).toString("base64")}`;
}

type MethodResponse = [string, Record<string, unknown>, string];

async function jmap(
  method: string,
  args: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const res = await fetch(`${BASE}/jmap/`, {
    method: "POST",
    headers: { authorization: authHeader(), "content-type": "application/json" },
    body: JSON.stringify({ using: USING, methodCalls: [[method, args, "0"]] }),
    cache: "no-store",
  });
  const text = await res.text();
  let parsed: { methodResponses?: MethodResponse[] };
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`stalwart ${method} → ${res.status}: ${text.slice(0, 200)}`);
  }
  const resp = parsed.methodResponses?.[0];
  if (!resp || resp[0] === "error") {
    throw new Error(`stalwart ${method} → ${JSON.stringify(resp?.[1] ?? {})}`);
  }
  return resp[1];
}

export type MailUser = {
  /** Registry id, e.g. "c". */
  id: string;
  /** Full address, e.g. "hi@xicoai.com". */
  email: string;
  displayName: string | null;
  /** Extra receiving addresses (full form) and "@domain" for catch-all. */
  aliases: string[];
  usedDiskQuota: number;
};

export function mailDomain(): string {
  return process.env.MAIL_PRIMARY_DOMAIN || "xicoai.com";
}

export function stalwartConfigured(): boolean {
  return Boolean(process.env.STALWART_ADMIN_SECRET);
}

let domainIdCache: string | null = null;
async function primaryDomainId(): Promise<string> {
  if (domainIdCache) return domainIdCache;
  const domain = mailDomain();
  const q = await jmap("x:Domain/query", { accountId: PRIMARY });
  const ids = (q.ids as string[]) ?? [];
  if (ids.length) {
    const g = await jmap("x:Domain/get", {
      accountId: PRIMARY,
      ids,
      properties: ["name"],
    });
    const match = (g.list as Array<{ id: string; name: string }>).find(
      (d) => d.name === domain,
    );
    if (match) return (domainIdCache = match.id);
  }
  throw new Error(`Mail domain ${domain} not provisioned on the server.`);
}

type RawUser = {
  id: string;
  name: string;
  emailAddress?: string;
  description?: string | null;
  aliases?: Record<string, { name: string }>;
  usedDiskQuota?: number;
};

function toMailUser(u: RawUser): MailUser {
  const aliases = Object.values(u.aliases ?? {}).map((a) => a.name);
  return {
    id: u.id,
    email: u.emailAddress || `${u.name}@${mailDomain()}`,
    displayName: u.description ?? null,
    aliases,
    usedDiskQuota: u.usedDiskQuota ?? 0,
  };
}

/** All mailboxes (individual user accounts). */
export async function listMailUsers(): Promise<MailUser[]> {
  const q = await jmap("x:Account/query", { accountId: PRIMARY });
  const ids = (q.ids as string[]) ?? [];
  if (!ids.length) return [];
  const g = await jmap("x:Account/get", {
    accountId: PRIMARY,
    ids,
    properties: ["name", "emailAddress", "description", "aliases", "usedDiskQuota"],
  });
  return (g.list as RawUser[])
    .map(toMailUser)
    .sort((a, b) => a.email.localeCompare(b.email));
}

/** Create a mailbox. `local` is the part before @; the domain is fixed. */
export async function createMailUser(opts: {
  local: string;
  password: string;
  displayName?: string | null;
}): Promise<string> {
  const domainId = await primaryDomainId();
  const res = await jmap("x:Account/set", {
    accountId: PRIMARY,
    create: {
      u1: {
        "@type": "User",
        name: opts.local,
        domainId,
        description: opts.displayName || undefined,
        credentials: { "0": { "@type": "Password", secret: opts.password } },
      },
    },
  });
  const created = (res.created as Record<string, { id: string }>)?.u1;
  if (!created) {
    const err = (res.notCreated as Record<string, unknown>)?.u1;
    throw new Error(`create failed: ${JSON.stringify(err)}`);
  }
  return created.id;
}

export async function setMailUserPassword(
  id: string,
  password: string,
): Promise<void> {
  const res = await jmap("x:Account/set", {
    accountId: PRIMARY,
    update: {
      [id]: { credentials: { "0": { "@type": "Password", secret: password } } },
    },
  });
  if (!(res.updated as Record<string, unknown>)?.[id] && (res.notUpdated as Record<string, unknown>)?.[id]) {
    throw new Error(`password reset failed: ${JSON.stringify((res.notUpdated as Record<string, unknown>)[id])}`);
  }
}

/** Replace alias list. Each entry is an EmailAlias {name, domainId}; the
 * literal local part "@domain" (name "*"/catch-all handled by caller). */
export async function setMailUserAliases(
  id: string,
  aliasLocals: string[],
): Promise<void> {
  const domainId = await primaryDomainId();
  const aliases: Record<string, { name: string; domainId: string; enabled: boolean }> = {};
  aliasLocals.forEach((local, i) => {
    aliases[String(i)] = { name: local, domainId, enabled: true };
  });
  const res = await jmap("x:Account/set", {
    accountId: PRIMARY,
    update: { [id]: { aliases } },
  });
  if ((res.notUpdated as Record<string, unknown>)?.[id]) {
    throw new Error(`alias update failed: ${JSON.stringify((res.notUpdated as Record<string, unknown>)[id])}`);
  }
}

export async function deleteMailUser(id: string): Promise<void> {
  const res = await jmap("x:Account/set", {
    accountId: PRIMARY,
    destroy: [id],
  });
  const destroyed = (res.destroyed as string[]) ?? [];
  if (!destroyed.includes(id)) {
    throw new Error(`delete failed: ${JSON.stringify(res.notDestroyed ?? {})}`);
  }
}
