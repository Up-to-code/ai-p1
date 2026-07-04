import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { getBlogPost, getBlogPosts } from "@/lib/strapi";
import { BlogDetail } from "@/components/blog/blog-detail";
import { AppPageShell } from "@/components/shared";
import { articleSchema, breadcrumbSchema, jsonLdScript, organizationSchema } from "@/lib/json-ld";
import { brandDomainUrl } from "@qentrah/brand-identity";
import type { Locale } from "@/lib/content";

export const revalidate = 3600;

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const isAr = locale === "ar";
  const siteUrl = brandDomainUrl("root");

  const post = await getBlogPost(slug, locale as "en" | "ar");
  if (!post) return { title: isAr ? "المقالة غير موجودة" : "Post not found" };

  const seoTitle = post.seo?.title ?? post.title;
  const seoDescription = post.seo?.description ?? post.excerpt;
  const ogImage = post.seo?.ogImage?.url ?? post.heroImage?.url ?? `${siteUrl}/logo.ico`;

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: post.seo?.keywords ?? post.tags?.join(", "),
    authors: [{ name: post.author }],
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: [{ url: ogImage }],
      url: `${siteUrl}/${locale}/blog/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: [ogImage],
    },
    alternates: {
      canonical: post.seo?.canonical ?? `${siteUrl}/${locale}/blog/${slug}`,
      languages: {
        "x-default": `${siteUrl}/en/blog/${slug}`,
        en: `${siteUrl}/en/blog/${slug}`,
        ar: `${siteUrl}/ar/blog/${slug}`,
        fr: `${siteUrl}/fr/blog/${slug}`,
      },
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  const siteUrl = brandDomainUrl("root");

  const post = await getBlogPost(slug, locale as "en" | "ar");
  if (!post) notFound();

  const jsonLd = [
    organizationSchema(locale as Locale),
    articleSchema(post, locale as Locale),
    breadcrumbSchema(locale as Locale, [
      { name: "Home", url: `${siteUrl}/${locale}` },
      { name: locale === "ar" ? "المدونة" : "Blog", url: `${siteUrl}/${locale}/blog` },
      { name: post.title, url: `${siteUrl}/${locale}/blog/${slug}` },
    ]),
  ];

  return (
    <>
      <Script
        id="blog-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <AppPageShell contentClassName="py-12">
        <BlogDetail post={post} locale={locale} />
      </AppPageShell>
    </>
  );
}

export async function generateStaticParams() {
  const response = await getBlogPosts("en");
  return response.docs.map((post) => ({ slug: post.slug }));
}
