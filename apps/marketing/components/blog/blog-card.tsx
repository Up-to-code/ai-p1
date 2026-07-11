import Link from "next/link";
import Image from "next/image";
import type { StrapiBlogPost } from "@/lib/strapi";

type BlogCardProps = {
  post: StrapiBlogPost;
  locale: string;
};

export function BlogCard({ post, locale }: BlogCardProps) {
  const publishDate = new Date(post.publishedAt).toLocaleDateString(
    locale === "ar" ? "ar-EG" : locale === "fr" ? "fr-FR" : "en-US",
    { year: "numeric", month: "long", day: "numeric" },
  );

  const cardImage = post.cardImage ?? post.heroImage;

  return (
    <Link
      href={`/${locale}/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--q-border)] bg-[var(--marketing-panel)] shadow-[var(--marketing-shadow)] transition-all hover:border-[var(--q-border-strong)] hover:bg-[var(--marketing-panel-hover)]"
    >
      {cardImage && (
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={cardImage.url}
            alt={cardImage.alt ?? post.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        {post.category && (
          <span className="mb-2 inline-block w-fit rounded-md border border-[var(--q-border)] bg-[var(--q-bg-secondary)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--q-text-secondary)]">
            {post.category}
          </span>
        )}
        <h3 className="text-lg font-bold text-[var(--q-text-primary)]">{post.title}</h3>
        <p className="mt-2 flex-1 text-sm text-[var(--q-text-secondary)] line-clamp-2">
          {post.excerpt}
        </p>
        <div className="mt-4 flex items-center gap-3">
          {post.authorAvatar && (
            <div className="relative h-8 w-8 overflow-hidden rounded-full">
              <Image
                src={post.authorAvatar.url}
                alt={post.authorAvatar.alt ?? post.author}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex flex-1 flex-col">
            <span className="text-xs font-medium text-[var(--q-text-primary)]">{post.author}</span>
            {post.authorRole && (
              <span className="text-[10px] text-[var(--q-text-muted)]">{post.authorRole}</span>
            )}
          </div>
          <div className="text-xs text-[var(--q-text-muted)]">
            <span>{publishDate}</span>
            {post.readingTime && <span className="ml-2">· {post.readingTime} min</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
