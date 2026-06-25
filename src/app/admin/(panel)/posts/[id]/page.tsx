import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { posts } from "@/db/schema";
import { PostForm } from "../post-form";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rows = await getDb()
    .select()
    .from(posts)
    .where(eq(posts.id, Number(id)))
    .limit(1);
  const post = rows[0];
  if (!post) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/admin/posts" className="text-sm text-muted hover:text-foreground">
          ← 返回文章列表
        </Link>
        <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight">
          编辑文章
        </h1>
      </div>
      <PostForm post={post} />
    </div>
  );
}
