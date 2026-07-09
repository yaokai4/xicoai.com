"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  jmapSession,
  listMailboxes,
  getIdentities,
  sendEmail,
  setSeen,
  setFlagged,
  moveEmail,
  trashOrDelete,
  createContact,
  updateContact,
  deleteContact,
  type Credentials,
} from "@/lib/webmail/jmap";
import {
  setWebmailSession,
  clearWebmailSession,
  getWebmailCredentials,
} from "@/lib/webmail/session";
import { requireWebmail } from "@/app/webmail/_lib";

export type LoginState = { error?: string };

/* ── auth ──────────────────────────────────────────────────── */

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "请输入邮箱和密码" };

  const cred: Credentials = { email, password };
  let ok = false;
  try {
    ok = Boolean(await jmapSession(cred));
  } catch (e) {
    console.error("webmail login jmap error", e);
    return { error: "邮件服务器暂时不可用，请稍后再试" };
  }
  if (!ok) return { error: "邮箱或密码错误" };

  await setWebmailSession(cred);
  redirect("/webmail");
}

export async function logoutAction() {
  await clearWebmailSession();
  redirect("/webmail/login");
}

/* ── compose / send ────────────────────────────────────────── */

export type SendState = { error?: string; ok?: boolean };

export async function sendAction(
  _prev: SendState,
  formData: FormData,
): Promise<SendState> {
  const { cred, session } = await requireWebmail();

  const parseAddrs = (v: string) =>
    v
      .split(/[,;\s]+/)
      .map((x) => x.trim())
      .filter((x) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x))
      .map((email) => ({ email }));

  const to = parseAddrs(String(formData.get("to") ?? ""));
  const cc = parseAddrs(String(formData.get("cc") ?? ""));
  const subject = String(formData.get("subject") ?? "").trim();
  const text = String(formData.get("body") ?? "");
  const inReplyTo = String(formData.get("inReplyTo") ?? "").trim() || null;
  const asDraft = formData.get("draft") === "1";

  if (!to.length && !asDraft) return { error: "请填写至少一个有效的收件人" };

  try {
    const mailboxes = await listMailboxes(cred, session);
    const sent = mailboxes.find((m) => m.role === "sent");
    const drafts = mailboxes.find((m) => m.role === "drafts");
    const identities = await getIdentities(cred, session);
    const identity =
      identities.find((i) => i.email === cred.email) ?? identities[0];
    if (!identity) return { error: "找不到可用的发信身份" };

    await sendEmail(cred, session, {
      identityId: identity.id,
      from: { name: identity.name || null, email: identity.email },
      to,
      cc,
      subject,
      text,
      inReplyTo,
      sentMailboxId: (asDraft ? drafts : sent)?.id ?? sent?.id ?? mailboxes[0].id,
      drafts: asDraft,
    });
  } catch (e) {
    console.error("sendAction failed", e);
    return { error: "发送失败，请稍后重试" };
  }

  redirect(asDraft ? "/webmail?folder=drafts&sent=draft" : "/webmail?sent=1");
}

/* ── message mutations ─────────────────────────────────────── */

async function ctx() {
  const cred = await getWebmailCredentials();
  if (!cred) throw new Error("unauthorized");
  const session = await jmapSession(cred);
  if (!session) throw new Error("unauthorized");
  return { cred, session };
}

export async function markSeenAction(id: string, seen: boolean) {
  const { cred, session } = await ctx();
  await setSeen(cred, session, id, seen);
  revalidatePath("/webmail");
}

export async function toggleFlagAction(id: string, on: boolean) {
  const { cred, session } = await ctx();
  await setFlagged(cred, session, id, on);
  revalidatePath("/webmail");
}

export async function moveAction(id: string, mailboxId: string) {
  const { cred, session } = await ctx();
  await moveEmail(cred, session, id, mailboxId);
  revalidatePath("/webmail");
}

export async function deleteAction(id: string, inTrash: boolean) {
  const { cred, session } = await ctx();
  const mailboxes = await listMailboxes(cred, session);
  const trash = mailboxes.find((m) => m.role === "trash");
  await trashOrDelete(cred, session, id, trash?.id ?? mailboxes[0].id, inTrash);
  revalidatePath("/webmail");
}

/* ── contacts ──────────────────────────────────────────────── */

export type ContactState = { error?: string; ok?: boolean };

export async function saveContactAction(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const { cred, session } = await requireWebmail();
  const id = String(formData.get("id") ?? "").trim();
  const input = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim() || undefined,
    phone: String(formData.get("phone") ?? "").trim() || undefined,
    org: String(formData.get("org") ?? "").trim() || undefined,
    note: String(formData.get("note") ?? "").trim() || undefined,
  };
  if (!input.name) return { error: "请填写联系人姓名" };
  try {
    if (id) await updateContact(cred, session, id, input);
    else await createContact(cred, session, input);
  } catch (e) {
    console.error("saveContact failed", e);
    return { error: "保存失败" };
  }
  revalidatePath("/webmail/contacts");
  return { ok: true };
}

export async function deleteContactAction(id: string) {
  const { cred, session } = await ctx();
  await deleteContact(cred, session, id);
  revalidatePath("/webmail/contacts");
}
