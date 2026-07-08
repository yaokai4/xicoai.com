"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import {
  createMailUser,
  deleteMailUser,
  getMailUser,
  mailDomain,
  setMailUserAliases,
  setMailUserPassword,
} from "@/lib/stalwart";

export type MailUserActionState = {
  error?: string;
  ok?: boolean;
  /** Shown ONCE after create/reset — we never store plaintext anywhere. */
  password?: string;
  account?: string;
};

/** Random 16-char password that survives every mail client's input rules. */
function generatePassword(): string {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  return Array.from(
    { length: 16 },
    () => alphabet[randomInt(0, alphabet.length)],
  ).join("");
}

function normalizeLocal(raw: string): string | null {
  const local = raw.trim().toLowerCase().replace(/@.*$/, "");
  return /^[a-z0-9][a-z0-9._-]{0,63}$/.test(local) ? local : null;
}

export async function createMailUserAction(
  _prev: MailUserActionState,
  formData: FormData,
): Promise<MailUserActionState> {
  await requireAdmin();
  const local = normalizeLocal(String(formData.get("local") ?? ""));
  if (!local) return { error: "用户名只能包含字母、数字、._-，且以字母/数字开头" };
  const displayName =
    String(formData.get("displayName") ?? "").trim().slice(0, 128) || null;
  const quotaGb = Math.min(
    50,
    Math.max(1, Number(formData.get("quotaGb")) || 2),
  );

  const account = `${local}@${mailDomain()}`;
  const password = generatePassword();
  try {
    await createMailUser({
      name: account,
      password,
      displayName,
      quotaBytes: quotaGb * 1024 * 1024 * 1024,
    });
  } catch (e) {
    console.error("createMailUser failed", e);
    const msg = String(e);
    return {
      error: msg.includes("exists") || msg.includes("409")
        ? "该账号已存在"
        : "创建失败（邮件后端未就绪或网络错误）",
    };
  }
  revalidatePath("/admin/mail/users");
  return { ok: true, account, password };
}

export async function resetMailPasswordAction(
  account: string,
): Promise<MailUserActionState> {
  await requireAdmin();
  const password = generatePassword();
  try {
    await setMailUserPassword(account, password);
  } catch (e) {
    console.error("resetMailPassword failed", e);
    return { error: "重置失败" };
  }
  return { ok: true, account, password };
}

export async function deleteMailUserAction(
  account: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  try {
    await deleteMailUser(account);
  } catch (e) {
    console.error("deleteMailUser failed", e);
    return { error: "删除失败" };
  }
  revalidatePath("/admin/mail/users");
  return {};
}

/** Replace the alias list (extra receiving addresses) of an account. */
export async function setAliasesAction(
  account: string,
  aliasesRaw: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  const domain = mailDomain();
  const aliases: string[] = [];
  for (const line of aliasesRaw.split(/[\n,;]+/)) {
    const t = line.trim().toLowerCase();
    if (!t) continue;
    if (t === "catch-all" || t === `@${domain}`) {
      aliases.push(`@${domain}`); // literal "@domain" = catch-all in Stalwart
      continue;
    }
    const local = normalizeLocal(t);
    if (!local) return { error: `别名格式不合法：${t}` };
    const addr = `${local}@${domain}`;
    if (addr !== account) aliases.push(addr);
  }
  try {
    await setMailUserAliases(account, [...new Set(aliases)]);
  } catch (e) {
    console.error("setAliases failed", e);
    return { error: "保存别名失败" };
  }
  revalidatePath("/admin/mail/users");
  return {};
}

/** Fetch one account fresh (for the alias editor). */
export async function getMailUserAction(
  account: string,
): Promise<{ emails?: string[]; error?: string }> {
  await requireAdmin();
  try {
    const p = await getMailUser(account);
    return { emails: p.emails ?? [] };
  } catch {
    return { error: "读取失败" };
  }
}
