import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMarketingPage } from "@/lib/strapi";
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
  const page = await getMarketingPage("about", locale);
  return page ? generateCMSMetadata(page) : generateFallbackMetadata("about", locale);
}

export default async function AboutPageCMS({ params }: Props) {
  const { locale: localeParam } = await params;
  if (!isValidLocale(localeParam)) notFound();

  const locale = localeParam as LocaleCode;
  const page = await getMarketingPage("about", locale);

  if (!page) {
    const { WorkspaceAboutPage } = await import("@/components/marketing/workspace-public/about-page");
    return <WorkspaceAboutPage />;
  }

  return <PageRenderer page={page} />;
}
