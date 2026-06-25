import Link from "next/link";
import { PostForm } from "../post-form";

export const dynamic = "force-dynamic";

export default function NewPostPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/admin/posts" className="text-sm text-muted hover:text-foreground">
          ← 返回文章列表
        </Link>
        <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight">
          写文章
        </h1>
      </div>
      <PostForm />
    </div>
  );
}
