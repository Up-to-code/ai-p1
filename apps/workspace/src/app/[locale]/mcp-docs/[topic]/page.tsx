import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { WorkspaceDocsJsonLd } from "@/components/seo-json-ld";
import { McpDocsPage } from "../_components/mcp-docs";
import { docsTopics, getDocsMetadata, isDocsTopic, getDocData, docsTopicsList, DocsTopicSlug } from "../_components/mcp-docs-data";

export function generateStaticParams() {
  return docsTopics
    .filter((topic) => topic.slug !== "overview")
    .map((topic) => ({ topic: topic.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; topic: string }>;
}): Promise<Metadata> {
  const { locale, topic } = await params;
  if (!isDocsTopic(topic) || topic === "overview") {
    return getDocsMetadata(locale, "overview");
  }

  return getDocsMetadata(locale, topic);
}

export default async function DocsTopicPage({
  params,
}: {
  params: Promise<{ locale: string; topic: string }>;
}) {
  const { locale, topic } = await params;

  if (!isDocsTopic(topic) || topic === "overview") {
    notFound();
  }

  const activeLocale = locale === "ar" ? "ar" : "en";
  const currentDoc = getDocData(activeLocale, topic);
  const sidebarTopics = docsTopicsList.map((slug) => getDocData(activeLocale, slug as DocsTopicSlug));

  return (
    <>
      <WorkspaceDocsJsonLd locale={locale} />
      <McpDocsPage
        locale={locale}
        topicSlug={topic}
        currentDoc={currentDoc}
        sidebarTopics={sidebarTopics}
      />
    </>
  );
}
