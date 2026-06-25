"use client";

import { useActionState } from "react";
import { savePost, deletePost, type ActionState } from "@/app/admin/actions";
import type { Post } from "@/db/schema";

const inputCls =
  "w-full rounded-lg border border-border bg-white/[0.02] px-3 py-2 text-sm text-foreground outline-none focus:border-brand/60";

export function PostForm({ post }: { post?: Post }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    savePost,
    {},
  );

  return (
    <form action={action} className="flex flex-col gap-8">
      {post && <input type="hidden" name="id" value={post.id} />}

      <Section title="基本信息">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Slug（URL，英文）">
            <input
              name="slug"
              required
              defaultValue={post?.slug}
              className={inputCls}
              placeholder="why-we-build-machi"
            />
          </Field>
          <Field label="标签（选填）">
            <input name="tag" defaultValue={post?.tag ?? ""} className={inputCls} />
          </Field>
          <Field label="封面色（hex，选填）">
            <input
              name="coverColor"
              defaultValue={post?.coverColor ?? ""}
              className={inputCls}
              placeholder="#7c8cff"
            />
          </Field>
          <Field label="状态">
            <select
              name="status"
              defaultValue={post?.status ?? "draft"}
              className={inputCls}
            >
              <option value="draft">草稿</option>
              <option value="published">发布（公开可见）</option>
            </select>
          </Field>
        </div>
      </Section>

      <L10nField label="标题" base="title" post={post} field="title" required />
      <L10nTextarea label="摘要" base="excerpt" post={post} field="excerpt" rows={3} />
      <L10nTextarea label="正文（段落用空行分隔）" base="body" post={post} field="body" rows={12} />

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-bg transition-transform hover:scale-[1.03] disabled:opacity-50"
        >
          {pending ? "保存中…" : "保存"}
        </button>
        {post && (
          <button
            type="submit"
            formAction={deletePost}
            className="rounded-full border border-border px-5 py-2.5 text-sm text-red-400 transition-colors hover:border-red-400/40"
          >
            删除
          </button>
        )}
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface/40 p-6">
      <h2 className="mb-4 text-sm font-medium text-muted">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-faint">{label}</span>
      {children}
    </div>
  );
}

function defVal(post: Post | undefined, field: keyof Post, lang: "zh" | "ja" | "en") {
  const v = post?.[field] as { zh?: string; ja?: string; en?: string } | null | undefined;
  return v?.[lang] ?? "";
}

function L10nField({
  label,
  base,
  post,
  field,
  required,
}: {
  label: string;
  base: string;
  post?: Post;
  field: keyof Post;
  required?: boolean;
}) {
  return (
    <Section title={label}>
      <div className="grid gap-3 sm:grid-cols-3">
        {(["zh", "ja", "en"] as const).map((lang) => (
          <Field key={lang} label={lang.toUpperCase()}>
            <input
              name={`${base}_${lang}`}
              required={required && lang === "zh"}
              defaultValue={defVal(post, field, lang)}
              className={inputCls}
            />
          </Field>
        ))}
      </div>
    </Section>
  );
}

function L10nTextarea({
  label,
  base,
  post,
  field,
  rows = 6,
}: {
  label: string;
  base: string;
  post?: Post;
  field: keyof Post;
  rows?: number;
}) {
  return (
    <Section title={label}>
      <div className="grid gap-3 lg:grid-cols-3">
        {(["zh", "ja", "en"] as const).map((lang) => (
          <Field key={lang} label={lang.toUpperCase()}>
            <textarea
              name={`${base}_${lang}`}
              rows={rows}
              defaultValue={defVal(post, field, lang)}
              className={`${inputCls} resize-y`}
            />
          </Field>
        ))}
      </div>
    </Section>
  );
}
