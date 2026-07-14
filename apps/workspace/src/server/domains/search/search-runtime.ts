import { envReader } from "@/packages/config/env-reader";
import { MeilisearchSearchAdapter } from "./meilisearch-adapter";

export function createConfiguredSearchProvider() {
  const baseUrl = envReader.read("MEILISEARCH_URL", "").trim();
  const apiKey = envReader.read("MEILISEARCH_API_KEY", "").trim();
  if (!baseUrl || !apiKey) return null;
  return new MeilisearchSearchAdapter({
    baseUrl,
    apiKey,
    indexPrefix: envReader.read("MEILISEARCH_INDEX_PREFIX", "qentrah_search").trim(),
  });
}
