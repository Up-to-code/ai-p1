import type { Metadata } from "next";
import fs from "fs";
import path from "path";

import { workspacePublicMetadata } from "@/lib/seo/public-metadata";
import { docsTopicsList, DocsTopicSlug, DocData } from "./mcp-docs-shared";

export { docsTopics, isDocsTopic, docsTopicsList } from "./mcp-docs-shared";
export type { DocsTopicSlug, DocData } from "./mcp-docs-shared";

function localeKey(locale: string): "en" | "ar" {
  return locale === "ar" ? "ar" : "en";
}

export function getDocData(locale: string, slug: DocsTopicSlug): DocData {
  const activeLocale = localeKey(locale);
  const contentDir = path.join(process.cwd(), "src", "app", "[locale]", "docs", "_content", activeLocale);
  const filePath = path.join(contentDir, `${slug}.md`);

  try {
    const rawContent = fs.readFileSync(filePath, "utf8");
    const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
    const match = rawContent.match(frontmatterRegex);

    if (!match) {
      return {
        slug,
        title: slug,
        label: slug,
        description: "",
        content: rawContent,
      };
    }

    const [, yamlBlock, content] = match;
    const metadata: Record<string, string> = {};

    yamlBlock.split("\n").forEach((line) => {
      const colonIndex = line.indexOf(":");
      if (colonIndex > -1) {
        const key = line.slice(0, colonIndex).trim();
        let value = line.slice(colonIndex + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        metadata[key] = value;
      }
    });

    return {
      slug,
      title: metadata.title || slug,
      label: metadata.label || slug,
      description: metadata.description || "",
      content: content.trim(),
    };
  } catch (error) {
    console.error(`Error loading doc ${slug} for locale ${activeLocale}:`, error);
    return {
      slug,
      title: slug,
      label: slug,
      description: "",
      content: "",
    };
  }
}

export function getDocsMetadata(locale: string, topicSlug: DocsTopicSlug): Metadata {
  const doc = getDocData(locale, topicSlug);
  return workspacePublicMetadata({
    locale,
    path: topicSlug === "overview" ? "/docs" : `/docs/${topicSlug}`,
    title: `${doc.title} | Qentrah MCP`,
    description: doc.description,
  });
}
