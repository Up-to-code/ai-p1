import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { docsTopics, getDocsMetadata, isDocsTopic, McpDocsPage } from "../_components/mcp-docs";

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

  return <McpDocsPage locale={locale} topicSlug={topic} />;
}
