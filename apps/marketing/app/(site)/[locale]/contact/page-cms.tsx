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
  const page = await getMarketingPage("contact", locale);

  if (!page) {
    const isAr = locale === "ar";
    return {
      title: isAr ? "اتصل بنا | Qentrah" : "Contact | Qentrah",
      description: isAr
        ? "تواصل مع فريق كانترا"
        : "Get in touch with the Qentrah team",
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

export default async function ContactPageCMS({ params }: Props) {
  const { locale: localeParam } = await params;

  if (!isValidLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as LocaleCode;
  const page = await getMarketingPage("contact", locale);

  if (!page) {
    // Fallback to basic contact page if CMS content not available
    const { WorkspaceContactPage } = await import("@/components/marketing/workspace-public/contact-page");
    return <WorkspaceContactPage />;
  }

  return <PageRenderer page={page} />;
}
