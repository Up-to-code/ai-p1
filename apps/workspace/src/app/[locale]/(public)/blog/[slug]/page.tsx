import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

import { getBlogPost, getBlogSlugs } from "@/lib/blog/workspace-blog";
import { publicSeoLocale, workspacePublicMetadata } from "@/lib/seo/public-metadata";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return Array.from(new Set([...getBlogSlugs("en"), ...getBlogSlugs("ar")])).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, slug } = await params;
  const post = getBlogPost(locale, slug);

  if (!post) {
    return workspacePublicMetadata({
      locale,
      path: "/blog",
      title: publicSeoLocale(locale) === "ar" ? "مدونة كانترا" : "Qentrah Blog",
      description: publicSeoLocale(locale) === "ar"
        ? "ملاحظات منتج وأدلة تشغيلية للفرق العقارية."
        : "Product notes and operating guides for real estate teams.",
    });
  }

  return workspacePublicMetadata({
    locale,
    path: `/blog/${post.slug}`,
    title: post.title,
    description: post.description,
    type: "article",
    publishedTime: post.date,
    authors: [post.author],
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const post = getBlogPost(locale, slug);

  if (!post) notFound();

  const isAr = locale === "ar";

  return (
    <main className="bg-white px-6 py-28 dark:bg-zinc-950 md:py-32" dir={isAr ? "rtl" : "ltr"}>
      <article className="mx-auto max-w-3xl">
        <div className="border-b border-zinc-200 pb-8 dark:border-white/10">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-700 dark:text-blue-300">
            {post.category}
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-950 dark:text-white md:text-6xl rtl:leading-[1.16]">
            {post.title}
          </h1>
          <p className="mt-5 text-base font-medium leading-8 text-zinc-600 dark:text-zinc-400">
            {post.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
            <span>{post.author}</span>
            <span>{post.date}</span>
          </div>
        </div>

        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          components={{
            h2: ({ children }) => (
              <h2 className="mt-10 text-2xl font-black tracking-tight text-zinc-950 dark:text-white">
                {children}
              </h2>
            ),
            p: ({ children }) => (
              <p className="mt-5 text-base font-medium leading-8 text-zinc-600 dark:text-zinc-400">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="mt-5 list-disc space-y-2 ps-6 text-base font-medium leading-8 text-zinc-600 dark:text-zinc-400">
                {children}
              </ul>
            ),
            li: ({ children }) => <li>{children}</li>,
          }}
        >
          {post.content}
        </ReactMarkdown>
      </article>
    </main>
  );
}
