import Link from "next/link";
import Image from "next/image";
import { payloadMediaUrl, type PayloadBlogPost } from "@/lib/payload-api";

type BlogCardProps = {
  post: PayloadBlogPost;
  locale: string;
};

export function BlogCard({ post, locale }: BlogCardProps) {
  const publishDate = new Date(post.publishedAt).toLocaleDateString(
    locale === "ar" ? "ar-SA" : "en-US",
    { year: "numeric", month: "long", day: "numeric" },
  );

  // Use cardImage if available, fallback to heroImage
  const cardImage = post.cardImage || post.heroImage;

  return (
    <Link
      href={`/${locale}/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white transition-all hover:shadow-lg dark:border-white/10 dark:bg-white/[0.03]"
    >
      {cardImage && (
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={payloadMediaUrl(cardImage.url)}
            alt={cardImage.alt || post.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        {post.category && (
          <span className="mb-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
            {post.category}
          </span>
        )}
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
          {post.title}
        </h3>
        <p className="mt-2 flex-1 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
          {post.excerpt}
        </p>
        <div className="mt-4 flex items-center gap-3">
          {post.authorAvatar && (
            <div className="relative h-8 w-8 overflow-hidden rounded-full">
              <Image
                src={payloadMediaUrl(post.authorAvatar.url)}
                alt={post.authorAvatar.alt || post.author}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex flex-1 flex-col">
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {post.author}
            </span>
            {post.authorRole && (
              <span className="text-[10px] text-zinc-400">
                {post.authorRole}
              </span>
            )}
          </div>
          <div className="text-xs text-zinc-400">
            <span>{publishDate}</span>
            {post.readingTime && (
              <span className="ml-2">· {post.readingTime} min</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
