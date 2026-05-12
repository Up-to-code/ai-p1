import type { Metadata } from "next";

import { getDocsMetadata, McpDocsPage } from "./_components/mcp-docs";

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
  return <McpDocsPage locale={locale} topicSlug="overview" />;
}
