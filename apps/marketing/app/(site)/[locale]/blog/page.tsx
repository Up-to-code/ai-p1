import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/content";
import { pageMetadata } from "@/lib/page-metadata";
import { getBlogPosts, type StrapiBlogPost } from "@/lib/strapi";
import { BlogList } from "@/components/blog/blog-list";
import { AppPageHeader, AppPageShell } from "@/components/shared";

export const revalidate = 3600;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? pageMetadata(locale as Locale, "blog") : {};
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  const isAr = locale === "ar";

  let posts: StrapiBlogPost[] = [];
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
            ? "أفكار حول إدارة المشاريع بالذكاء الاصطناعي، تشغيل الوكالات، وإنتاجية الفرق"
            : "Insights on AI-first project management, agency operations, and team productivity"
        }
      />
      <BlogList posts={posts} locale={locale} />
    </AppPageShell>
  );
}
