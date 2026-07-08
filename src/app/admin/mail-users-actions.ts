"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import {
  createMailUser,
  deleteMailUser,
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

  const account = `${local}@${mailDomain()}`;
  const password = generatePassword();
  try {
    await createMailUser({ local, password, displayName });
  } catch (e) {
    console.error("createMailUser failed", e);
    const msg = String(e);
    return {
      error:
        msg.includes("exists") || msg.includes("primaryKeyViolation")
          ? "该账号已存在"
          : "创建失败（邮件后端未就绪或网络错误）",
    };
  }
  revalidatePath("/admin/mail/users");
  return { ok: true, account, password };
}

export async function resetMailPasswordAction(
  id: string,
  account: string,
): Promise<MailUserActionState> {
  await requireAdmin();
  const password = generatePassword();
  try {
    await setMailUserPassword(id, password);
  } catch (e) {
    console.error("resetMailPassword failed", e);
    return { error: "重置失败" };
  }
  return { ok: true, account, password };
}

export async function deleteMailUserAction(
  id: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  try {
    await deleteMailUser(id);
  } catch (e) {
    console.error("deleteMailUser failed", e);
    return { error: "删除失败" };
  }
  revalidatePath("/admin/mail/users");
  return {};
}

/** Replace the alias list (extra receiving local-parts) of an account. */
export async function setAliasesAction(
  id: string,
  aliasesRaw: string,
): Promise<{ error?: string }> {
  await requireAdmin();
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
    console.error("setAliases failed", e);
    return { error: "保存别名失败" };
  }
  revalidatePath("/admin/mail/users");
  return {};
}
