import Image from "next/image";
import Link from "next/link";
import { payloadMediaUrl, type PayloadBlogPost } from "@/lib/payload-api";
import { lexicalToHtml } from "@/lib/lexical-to-html";

type BlogDetailProps = {
  post: PayloadBlogPost;
  locale: string;
};

export function BlogDetail({ post, locale }: BlogDetailProps) {
  const publishDate = new Date(post.publishedAt).toLocaleDateString(
    locale === "ar" ? "ar-SA" : "en-US",
    { year: "numeric", month: "long", day: "numeric" },
  );

  return (
    <article className="mx-auto max-w-4xl">
      <Link
        href={`/${locale}/blog`}
        className="mb-8 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-300"
      >
        ← {locale === "ar" ? "العودة للمدونة" : "Back to blog"}
      </Link>

      <header className="mb-8">
        {post.category && (
          <span className="mb-3 inline-block rounded-full bg-blue-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
            {post.category}
          </span>
        )}
        <h1 className="mt-4 text-3xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-5xl">
          {post.title}
        </h1>
        <div className="mt-6 flex items-center gap-4">
          {post.authorAvatar && (
            <div className="relative h-12 w-12 overflow-hidden rounded-full">
              <Image
                src={payloadMediaUrl(post.authorAvatar.url)}
                alt={post.authorAvatar.alt || post.author}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-900 dark:text-white">
              {post.author}
            </span>
            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              {post.authorRole && (
                <>
                  <span>{post.authorRole}</span>
                  <span>·</span>
                </>
              )}
              <span>{publishDate}</span>
              {post.readingTime && (
                <>
                  <span>·</span>
                  <span>
                    {post.readingTime}{" "}
                    {locale === "ar" ? "دقائق قراءة" : "min read"}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {post.heroImage && (
        <div className="relative mb-12 aspect-[21/9] overflow-hidden rounded-2xl">
          <Image
            src={payloadMediaUrl(post.heroImage.url)}
            alt={post.heroImage.alt || post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div
        className="prose prose-zinc prose-lg dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline dark:prose-a:text-blue-400"
        dangerouslySetInnerHTML={{ __html: lexicalToHtml(post.body) }}
      />

      <footer className="mt-16 border-t border-zinc-200 pt-8 dark:border-zinc-800">
        <div className="flex items-center gap-4">
          {post.authorAvatar && (
            <div className="relative h-16 w-16 overflow-hidden rounded-full">
              <Image
                src={payloadMediaUrl(post.authorAvatar.url)}
                alt={post.authorAvatar.alt || post.author}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              {post.author}
            </h3>
            {post.authorRole && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {post.authorRole}
              </p>
            )}
          </div>
        </div>
      </footer>
    </article>
  );
}
