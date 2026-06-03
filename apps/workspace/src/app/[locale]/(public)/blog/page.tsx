import { CalendarDays } from "lucide-react";

import { Link } from "@/i18n/routing";
import { getBlogPosts } from "@/lib/blog/workspace-blog";
import { publicPageMetadata } from "@/lib/seo/public-pages";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  return publicPageMetadata(locale, "blog");
}

export default async function BlogIndexPage({ params }: PageProps) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const posts = getBlogPosts(locale);

  return (
    <main className="bg-white px-6 py-28 dark:bg-zinc-950 md:py-32">
      <section className="mx-auto max-w-5xl">
        <div className="max-w-3xl">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-700 dark:text-blue-300">
            {isAr ? "المدونة" : "Blog"}
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-950 dark:text-white md:text-6xl rtl:leading-[1.12]">
            {isAr ? "أدلة تشغيلية لمساحة العمل العقارية" : "Operating notes for real estate teams"}
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-zinc-600 dark:text-zinc-400">
            {isAr
              ? "مقالات عملية حول إدارة البيانات العقارية، العملاء، المخزون، والتكاملات داخل كانترا."
              : "Practical notes on real estate data, clients, inventory, and integrations inside Qentrah Workspace."}
          </p>
        </div>

        <div className="mt-12 grid gap-4">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-3xl border border-zinc-200 bg-zinc-50 p-5 transition-colors hover:border-blue-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-blue-400/40 dark:hover:bg-white/[0.06] md:p-6"
            >
              <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                <span>{post.category}</span>
                <span className="h-1 w-1 rounded-full bg-zinc-300" />
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {post.date}
                </span>
              </div>
              <div className="mt-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                    {post.title}
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm font-medium leading-7 text-zinc-600 dark:text-zinc-400">
                    {post.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
