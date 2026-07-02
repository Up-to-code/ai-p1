import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMarketingPage } from "@/lib/cms-pages";
import { generateCMSMetadata, generateFallbackMetadata } from "@/lib/cms-seo";
import { PageRenderer } from "@/components/cms/page-renderer";
import { isValidLocale, type LocaleCode } from "@/lib/locales";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam } = await params;
  if (!isValidLocale(localeParam)) return {};

  const locale = localeParam as LocaleCode;
  const page = await getMarketingPage("docs", locale);
  return page ? generateCMSMetadata(page) : generateFallbackMetadata("docs", locale);
}

export default async function DocsPageCMS({ params }: Props) {
  const { locale: localeParam } = await params;
  if (!isValidLocale(localeParam)) notFound();

  const locale = localeParam as LocaleCode;
  const page = await getMarketingPage("docs", locale);

  if (!page) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold">Documentation</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Coming soon. Create a &quot;docs&quot; page in the CMS to customize this content.
        </p>
      </div>
    );
  }

  return <PageRenderer page={page} />;
}
