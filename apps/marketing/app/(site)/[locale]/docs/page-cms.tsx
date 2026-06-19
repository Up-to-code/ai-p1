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
  const page = await getMarketingPage("docs", locale);

  if (!page) {
    const isAr = locale === "ar";
    return {
      title: isAr ? "التوثيق | Qentrah" : "Documentation | Qentrah",
      description: isAr
        ? "توثيق عام لربط مساحة عمل كانترا"
        : "Public documentation for Qentrah Workspace",
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

export default async function DocsPageCMS({ params }: Props) {
  const { locale: localeParam } = await params;

  if (!isValidLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as LocaleCode;
  const page = await getMarketingPage("docs", locale);

  if (!page) {
    // Fallback to basic docs message if CMS content not available
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold">Documentation</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Coming soon. Create a "docs" page in the CMS to customize this content.
        </p>
      </div>
    );
  }

  return <PageRenderer page={page} />;
}
