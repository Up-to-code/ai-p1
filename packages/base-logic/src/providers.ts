export const OPENROUTER_EMBEDDING_MODEL = "openai/text-embedding-3-small";

export type ProviderId = "openrouter";

export function resolveEmbeddingModelName(value?: string | null): string {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : OPENROUTER_EMBEDDING_MODEL;
}
