import "server-only";

import { redirect } from "next/navigation";
import { getWebmailCredentials } from "@/lib/webmail/session";
import { jmapSession, type Credentials, type JmapSession } from "@/lib/webmail/jmap";

export type WebmailCtx = { cred: Credentials; session: JmapSession };

/** Resolve the logged-in user's JMAP context, or redirect to login. Server
 * components and actions both call this. A dead/rotated password → login. */
export async function requireWebmail(): Promise<WebmailCtx> {
  const cred = await getWebmailCredentials();
  if (!cred) redirect("/webmail/login");
  const session = await jmapSession(cred);
  if (!session) redirect("/webmail/login?expired=1");
  return { cred, session };
}
