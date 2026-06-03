import fs from "fs";
import path from "path";

import { publicSeoLocale, type PublicSeoLocale } from "@/lib/seo/public-metadata";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  content: string;
};

const requiredFields = ["title", "description", "date", "author", "category"] as const;

function contentDir(locale: PublicSeoLocale) {
  return path.join(process.cwd(), "src", "app", "[locale]", "(public)", "blog", "_content", locale);
}

function parseFrontmatter(rawContent: string) {
  const match = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return null;

  const [, yamlBlock, content] = match;
  const metadata: Record<string, string> = {};

  yamlBlock.split(/\r?\n/u).forEach((line) => {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) return;

    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    metadata[key] = value;
  });

  if (!requiredFields.every((field) => metadata[field])) return null;
  return { metadata: metadata as Record<(typeof requiredFields)[number], string>, content: content.trim() };
}

export function getBlogSlugs(locale: string) {
  const activeLocale = publicSeoLocale(locale);

  try {
    return fs
      .readdirSync(contentDir(activeLocale))
      .filter((file) => file.endsWith(".md"))
      .map((file) => file.replace(/\.md$/u, ""))
      .sort();
  } catch {
    return [];
  }
}

export function getBlogPost(locale: string, slug: string): BlogPost | null {
  const activeLocale = publicSeoLocale(locale);
  const filePath = path.join(contentDir(activeLocale), `${slug}.md`);

  try {
    const parsed = parseFrontmatter(fs.readFileSync(filePath, "utf8"));
    if (!parsed) return null;

    return {
      slug,
      title: parsed.metadata.title,
      description: parsed.metadata.description,
      date: parsed.metadata.date,
      author: parsed.metadata.author,
      category: parsed.metadata.category,
      content: parsed.content,
    };
  } catch {
    return null;
  }
}

export function getBlogPosts(locale: string) {
  return getBlogSlugs(locale)
    .map((slug) => getBlogPost(locale, slug))
    .filter((post): post is BlogPost => Boolean(post))
    .sort((left, right) => Date.parse(right.date) - Date.parse(left.date));
}
