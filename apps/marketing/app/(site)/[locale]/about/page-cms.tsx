import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMarketingPage } from "@/lib/cms-pages";
import { PageRenderer } from "@/components/cms/page-renderer";
import { isValidLocale, type LocaleCode } from "@/lib/locales";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam } = await params;

  if (!isValidLocale(localeParam)) {
    return {};
  }

  const locale = localeParam as LocaleCode;
  const page = await getMarketingPage("about", locale);

  if (!page) {
    const isAr = locale === "ar";
    return {
      title: isAr ? "عن كانترا | Qentrah" : "About | Qentrah",
      description: isAr
        ? "كانترا هي منصة تشغيل ذكية للوكالات والشركات الخدمية"
        : "Qentrah is an AI-first Work OS for agencies and professional service firms",
    };
  }

  const title = page.seo?.title || page.title;
  const description = page.seo?.description || page.excerpt || "";

  return {
    title,
    description,
    keywords: page.seo?.keywords,
    openGraph: {
      title,
      description,
      images: page.seo?.image
        ? [
            {
              url: page.seo.image.url,
              alt: page.seo.image.alt || title,
            },
          ]
        : undefined,
    },
    robots: {
      index: !page.seo?.noIndex,
      follow: !page.seo?.noIndex,
    },
    alternates: page.seo?.canonicalUrl
      ? {
          canonical: page.seo.canonicalUrl,
        }
      : undefined,
  };
}

export default async function AboutPageCMS({ params }: Props) {
  const { locale: localeParam } = await params;

  if (!isValidLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as LocaleCode;
  const page = await getMarketingPage("about", locale);

  if (!page) {
    // Fallback to hardcoded about page if CMS content not available
    const { WorkspaceAboutPage } = await import("@/components/marketing/workspace-public/about-page");
    return <WorkspaceAboutPage />;
  }

  return <PageRenderer page={page} />;
}
