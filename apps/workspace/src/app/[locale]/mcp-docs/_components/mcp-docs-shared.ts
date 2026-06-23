export const docsTopicsList = [
  "overview",
  "why-public",
  "endpoint",
  "create-link",
  "permissions",
  "examples",
  "security",
  "troubleshooting",
  "references",
] as const;

export type DocsTopicSlug = typeof docsTopicsList[number];

export const docsTopics = docsTopicsList.map((slug) => ({ slug }));

export type DocData = {
  slug: DocsTopicSlug;
  title: string;
  label: string;
  description: string;
  content: string;
};

export function isDocsTopic(value: string): value is DocsTopicSlug {
  return docsTopicsList.includes(value as DocsTopicSlug);
}
