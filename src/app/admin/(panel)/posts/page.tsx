import Link from "next/link";
import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { posts } from "@/db/schema";
import { pickL10n } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function PostsAdmin() {
  const all = await getDb()
    .select()
    .from(posts)
    .orderBy(desc(posts.createdAt));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          文章
        </h1>
        <Link
          href="/admin/posts/new"
          className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-bg transition-transform hover:scale-[1.03]"
        >
          + 写文章
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wider text-faint">
            <tr>
              <th className="px-5 py-3 font-medium">标题</th>
              <th className="px-5 py-3 font-medium">Slug</th>
              <th className="px-5 py-3 font-medium">状态</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {all.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-center text-faint">
                  还没有文章，点击右上角写一篇。
                </td>
              </tr>
            )}
            {all.map((post) => (
              <tr key={post.id} className="hover:bg-white/[0.02]">
                <td className="px-5 py-3 text-foreground">
                  {pickL10n(post.title, "zh")}
                </td>
                <td className="px-5 py-3 text-muted">{post.slug}</td>
                <td className="px-5 py-3">
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-xs " +
                      (post.status === "published"
                        ? "bg-accent/15 text-accent"
                        : "bg-white/10 text-muted")
                    }
                  >
                    {post.status === "published" ? "已发布" : "草稿"}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="text-muted hover:text-foreground"
                  >
                    编辑
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
