"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getWebmailCredentials, isMailAdmin } from "@/lib/webmail/session";
import {
  createMailUser,
  deleteMailUser,
  mailDomain,
  setMailUserAliases,
  setMailUserPassword,
} from "@/lib/stalwart";
import { requirePasswordChange } from "@/lib/webmail/password-policy";

/** Gate: the current webmail user must be a configured mail super-admin. */
async function requireMailAdmin(): Promise<void> {
  const cred = await getWebmailCredentials();
  if (!cred || !isMailAdmin(cred.email)) {
    throw new Error("forbidden");
  }
}

export type MailUserState = {
  error?: string;
  ok?: boolean;
  password?: string;
  account?: string;
};

function generatePassword(): string {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  return Array.from({ length: 16 }, () => a[randomInt(0, a.length)]).join("");
}

function normalizeLocal(raw: string): string | null {
  const local = raw.trim().toLowerCase().replace(/@.*$/, "");
  return /^[a-z0-9][a-z0-9._-]{0,63}$/.test(local) ? local : null;
}

export async function wmCreateUserAction(
  _prev: MailUserState,
  formData: FormData,
): Promise<MailUserState> {
  await requireMailAdmin();
  const local = normalizeLocal(String(formData.get("local") ?? ""));
  if (!local) return { error: "用户名只能包含字母、数字、._-，且以字母/数字开头" };
  const displayName =
    String(formData.get("displayName") ?? "").trim().slice(0, 128) || null;
  // Optional custom initial password; blank → auto-generate a temp one.
  const custom = String(formData.get("password") ?? "").trim();
  if (custom && custom.length < 8) {
    return { error: "自定义密码至少 8 位（留空则自动生成）" };
  }
  const account = `${local}@${mailDomain()}`;
  const password = custom || generatePassword();
  try {
    await createMailUser({ local, password, displayName });
    // New accounts must set their own password on first login.
    await requirePasswordChange(account);
  } catch (e) {
    console.error("wmCreateUser failed", e);
    const msg = String(e).toLowerCase();
    if (msg.includes("exists") || msg.includes("primarykeyviolation")) {
      return { error: "该账号已存在" };
    }
    if (msg.includes("weak") || msg.includes("invalidproperties")) {
      return { error: "初始密码强度不够，请用更长、更不常见的密码（或留空自动生成）。" };
    }
    return { error: "创建失败" };
  }
  revalidatePath("/webmail/admin");
  return { ok: true, account, password };
}

export async function wmResetPasswordAction(
  id: string,
  account: string,
): Promise<MailUserState> {
  await requireMailAdmin();
  const password = generatePassword();
  try {
    await setMailUserPassword(id, password);
    // An admin reset is a temp password — force the user to re-set it.
    await requirePasswordChange(account);
  } catch (e) {
    console.error("wmResetPassword failed", e);
    return { error: "重置失败" };
  }
  return { ok: true, account, password };
}

export async function wmSetAliasesAction(
  id: string,
  aliasesRaw: string,
): Promise<{ error?: string }> {
  await requireMailAdmin();
  const locals: string[] = [];
  for (const line of aliasesRaw.split(/[\n,;]+/)) {
    const t = line.trim().toLowerCase();
    if (!t) continue;
    const local = normalizeLocal(t);
    if (!local) return { error: `别名格式不合法：${t}` };
    locals.push(local);
  }
  try {
    await setMailUserAliases(id, [...new Set(locals)]);
  } catch (e) {
    console.error("wmSetAliases failed", e);
    return { error: "保存别名失败" };
  }
  revalidatePath("/webmail/admin");
  return {};
}

export async function wmDeleteUserAction(
  id: string,
): Promise<{ error?: string }> {
  await requireMailAdmin();
  try {
    await deleteMailUser(id);
  } catch (e) {
    console.error("wmDeleteUser failed", e);
    return { error: "删除失败" };
  }
  revalidatePath("/webmail/admin");
  return {};
}
