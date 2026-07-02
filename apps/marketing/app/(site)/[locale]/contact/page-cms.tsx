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
  const page = await getMarketingPage("contact", locale);
  return page ? generateCMSMetadata(page) : generateFallbackMetadata("contact", locale);
}

export default async function ContactPageCMS({ params }: Props) {
  const { locale: localeParam } = await params;
  if (!isValidLocale(localeParam)) notFound();

  const locale = localeParam as LocaleCode;
  const page = await getMarketingPage("contact", locale);

  if (!page) {
    const { WorkspaceContactPage } = await import(
      "@/components/marketing/workspace-public/contact-page"
    );
    return <WorkspaceContactPage />;
  }

  return <PageRenderer page={page} />;
}
