"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  jobs,
  posts,
  applications,
  joinSubmissions,
  settings,
  type L10n,
  type L10nList,
} from "@/db/schema";
import {
  SESSION_COOKIE,
  createSession,
  checkCredentials,
  verifySession,
} from "@/lib/auth";
import { SOCIAL_KEYS } from "@/lib/social";

export type ActionState = { error?: string };

async function requireAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
  if (!session) redirect("/admin/login");
  return session;
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!checkCredentials(username, password)) {
    return { error: "用户名或密码错误" };
  }
  const token = await createSession(username);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/admin");
}

export async function logoutAction() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

export async function saveSettings(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const db = getDb();
  try {
    for (const key of SOCIAL_KEYS) {
      const value = String(formData.get(key) ?? "").trim() || null;
      await db
        .insert(settings)
        .values({ key: `social_${key}`, value, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value, updatedAt: new Date() },
        });
    }
  } catch (e) {
    console.error(e);
    return { error: "保存失败" };
  }
  revalidatePath("/admin/settings");
  return {};
}

function l10n(formData: FormData, base: string): L10n {
  return {
    zh: String(formData.get(`${base}_zh`) ?? "").trim(),
    ja: String(formData.get(`${base}_ja`) ?? "").trim() || undefined,
    en: String(formData.get(`${base}_en`) ?? "").trim() || undefined,
  };
}

function l10nList(formData: FormData, base: string): L10nList {
  const toList = (v: string) =>
    v
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  return {
    zh: toList(String(formData.get(`${base}_zh`) ?? "")),
    ja: toList(String(formData.get(`${base}_ja`) ?? "")) || undefined,
    en: toList(String(formData.get(`${base}_en`) ?? "")) || undefined,
  };
}

export async function saveJob(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const idRaw = String(formData.get("id") ?? "");
  const id = idRaw ? Number(idRaw) : null;
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase();
  if (!slug) return { error: "slug 不能为空" };

  const values = {
    slug,
    title: l10n(formData, "title"),
    team: String(formData.get("team") ?? "").trim() || null,
    location: l10n(formData, "location"),
    employmentType: String(
      formData.get("employmentType") ?? "full_time",
    ) as typeof jobs.$inferInsert.employmentType,
    remote: formData.get("remote") === "on",
    summary: l10n(formData, "summary"),
    description: l10n(formData, "description"),
    requirements: l10nList(formData, "requirements"),
    status: String(
      formData.get("status") ?? "draft",
    ) as typeof jobs.$inferInsert.status,
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
    updatedAt: new Date(),
  };

  const db = getDb();
  try {
    if (id) {
      await db.update(jobs).set(values).where(eq(jobs.id, id));
    } else {
      await db.insert(jobs).values(values);
    }
  } catch (e) {
    console.error(e);
    return { error: "保存失败：slug 可能已存在" };
  }
  revalidatePath("/admin/jobs");
  redirect("/admin/jobs");
}

export async function deleteJob(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (id) await getDb().delete(jobs).where(eq(jobs.id, id));
  revalidatePath("/admin/jobs");
  redirect("/admin/jobs");
}

export async function setApplicationStatus(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const status = String(
    formData.get("status"),
  ) as typeof applications.$inferInsert.status;
  if (id) await getDb().update(applications).set({ status }).where(eq(applications.id, id));
  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${id}`);
}

export async function setJoinStatus(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const status = String(
    formData.get("status"),
  ) as typeof joinSubmissions.$inferInsert.status;
  if (id) await getDb().update(joinSubmissions).set({ status }).where(eq(joinSubmissions.id, id));
  revalidatePath("/admin/join");
}

export async function savePost(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const idRaw = String(formData.get("id") ?? "");
  const id = idRaw ? Number(idRaw) : null;
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase();
  if (!slug) return { error: "slug 不能为空" };

  const status = String(
    formData.get("status") ?? "draft",
  ) as typeof posts.$inferInsert.status;

  const db = getDb();

  // preserve original publish time when re-saving an already-published post
  let publishedAt: Date | null = null;
  if (status === "published") {
    publishedAt = new Date();
    if (id) {
      const existing = await db
        .select({ publishedAt: posts.publishedAt })
        .from(posts)
        .where(eq(posts.id, id))
        .limit(1);
      if (existing[0]?.publishedAt) publishedAt = existing[0].publishedAt;
    }
  }

  const values = {
    slug,
    title: l10n(formData, "title"),
    excerpt: l10n(formData, "excerpt"),
    body: l10n(formData, "body"),
    tag: String(formData.get("tag") ?? "").trim() || null,
    coverColor: String(formData.get("coverColor") ?? "").trim() || null,
    status,
    publishedAt,
    updatedAt: new Date(),
  };

  try {
    if (id) {
      await db.update(posts).set(values).where(eq(posts.id, id));
    } else {
      await db.insert(posts).values(values);
    }
  } catch (e) {
    console.error(e);
    return { error: "保存失败：slug 可能已存在" };
  }
  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function deletePost(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (id) await getDb().delete(posts).where(eq(posts.id, id));
  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}
