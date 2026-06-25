import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Eyebrow } from "@/components/ui/section";
import { getPostBySlug } from "@/lib/posts";
import { pickL10n } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "404" };
  return {
    title: pickL10n(post.title, locale),
    description: pickL10n(post.excerpt, locale),
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "blog" });
  const post = await getPostBySlug(slug);
  if (!post || post.status !== "published") notFound();

  const title = pickL10n(post.title, locale);
  const body = pickL10n(post.body, locale);
  const paragraphs = body.split(/\n{2,}/).filter(Boolean);
  const date = post.publishedAt ?? post.createdAt;

  return (
    <article className="pt-36 pb-24 sm:pt-44 sm:pb-32">
      <Container className="max-w-3xl">
        <Link
          href="/blog"
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          {t("backToList")}
        </Link>

        <div className="mt-6 flex items-center gap-3">
          {post.tag && <Eyebrow>{post.tag}</Eyebrow>}
          <span className="text-sm text-faint">
            {t("publishedOn")}{" "}
            {date?.toLocaleDateString(locale === "zh" ? "zh-CN" : locale)}
          </span>
        </div>

        <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-balance sm:text-5xl">
          {title}
        </h1>

        <div className="mt-10 flex flex-col gap-5 text-lg leading-relaxed text-muted/90">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-pretty">
              {p}
            </p>
          ))}
        </div>
      </Container>
    </article>
  );
}
