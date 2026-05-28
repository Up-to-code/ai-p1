import type { Metadata } from "next";

import { WorkspaceDocsJsonLd } from "@/components/seo-json-ld";
import { McpDocsPage } from "./_components/mcp-docs";
import { getDocData, getDocsMetadata, docsTopicsList, DocsTopicSlug } from "./_components/mcp-docs-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return getDocsMetadata(locale, "overview");
}

export default async function DocsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const activeLocale = locale === "ar" ? "ar" : "en";
  const currentDoc = getDocData(activeLocale, "overview");
  const sidebarTopics = docsTopicsList.map((slug) => getDocData(activeLocale, slug as DocsTopicSlug));

  return (
    <>
      <WorkspaceDocsJsonLd locale={locale} />
      <McpDocsPage
        locale={locale}
        topicSlug="overview"
        currentDoc={currentDoc}
        sidebarTopics={sidebarTopics}
      />
    </>
  );
}
