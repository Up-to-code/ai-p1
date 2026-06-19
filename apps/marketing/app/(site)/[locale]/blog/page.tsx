import type { Metadata } from "next";
import { getBlogPosts, type PayloadBlogPost } from "@/lib/payload-api";
import { BlogList } from "@/components/blog/blog-list";
import { AppPageHeader, AppPageShell } from "@/components/shared";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";

  return {
    title: isAr ? "المدونة | كانترا" : "Blog | Qentrah",
    description: isAr
      ? "أحدث المقالات والأخبار من كانترا"
      : "Latest articles and news from Qentrah",
  };
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  const isAr = locale === "ar";

  let posts: PayloadBlogPost[];
  try {
    const response = await getBlogPosts(locale as "en" | "ar");
    posts = response.docs;
  } catch {
    posts = [];
  }

  return (
    <AppPageShell contentClassName="space-y-8">
      <AppPageHeader
        eyebrow={isAr ? "المدونة" : "Blog"}
        title={isAr ? "أحدث المقالات" : "Latest Articles"}
        subtitle={
          isAr
            ? "أخبار ومقالات عن التقنية وإدارة الأعمال والشراكات"
            : "Insights about technology, business management, and partnerships"
        }
      />
      <BlogList posts={posts} locale={locale} />
    </AppPageShell>
  );
}
