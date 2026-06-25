import "server-only";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { posts, type Post } from "@/db/schema";

export async function getPublishedPosts(): Promise<Post[]> {
  try {
    const db = getDb();
    return await db
      .select()
      .from(posts)
      .where(eq(posts.status, "published"))
      .orderBy(desc(posts.publishedAt), desc(posts.createdAt));
  } catch (e) {
    console.error("getPublishedPosts failed", e);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(posts)
      .where(eq(posts.slug, slug))
      .limit(1);
    return rows[0] ?? null;
  } catch (e) {
    console.error("getPostBySlug failed", e);
    return null;
  }
}
