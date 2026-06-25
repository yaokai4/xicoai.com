import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/page-hero";
import { Container } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { SpotlightTracker } from "@/components/ui/spotlight-tracker";
import { getPublishedPosts } from "@/lib/posts";
import { pickL10n } from "@/lib/content";
import type { Post } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  return { title: t("eyebrow"), description: t("subtitle") };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "blog" });
  const posts = await getPublishedPosts();

  return (
    <>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <section className="pb-24 sm:pb-32">
        <Container>
          {posts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-surface/30 p-10 text-center">
              <p className="mx-auto max-w-md text-muted text-balance">
                {t("empty")}
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, i) => (
                <Reveal key={post.id} delay={(i % 3) * 0.08}>
                  <PostCard post={post} locale={locale} />
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}

function PostCard({ post, locale }: { post: Post; locale: string }) {
  const title = pickL10n(post.title, locale);
  const excerpt = pickL10n(post.excerpt, locale);
  const color = post.coverColor || "#7c8cff";
  const date = post.publishedAt ?? post.createdAt;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="spotlight-card group card-elevated flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface/60 transition-all duration-500 hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface"
    >
      <SpotlightTracker />
      <div
        className="h-32 w-full"
        style={{
          background: `radial-gradient(120% 120% at 0% 0%, ${color}40, transparent 60%), radial-gradient(120% 120% at 100% 100%, ${color}22, transparent 55%)`,
        }}
      />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2 text-xs text-faint">
          {post.tag && (
            <span className="rounded-full border border-border px-2 py-0.5">
              {post.tag}
            </span>
          )}
          <span>
            {date?.toLocaleDateString(locale === "zh" ? "zh-CN" : locale)}
          </span>
        </div>
        <h2 className="mt-3 font-display text-lg font-semibold leading-snug text-foreground">
          {title}
        </h2>
        {excerpt && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
            {excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}
