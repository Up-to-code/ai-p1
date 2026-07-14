import { z } from "zod";

export const searchResourceTypeSchema = z.enum([
  "space", "project", "task", "document", "comment", "message",
  "client", "contact", "company", "deal", "proposal", "contract",
  "engagement", "deliverable", "approval", "invoice", "expense", "payment",
]);
export const searchScopeTypeSchema = z.enum(["organization", "space", "project", "private"]);
export const searchSensitivitySchema = z.enum(["standard", "restricted", "confidential"]);
export const searchOutboxStatusSchema = z.enum(["pending", "processing", "completed", "dead_letter"]);

export const searchProjectionSchema = z.object({
  organizationId: z.string().min(1),
  resourceType: searchResourceTypeSchema,
  resourceId: z.string().min(1),
  route: z.string().min(1),
  title: z.string(),
  subtitle: z.string().optional(),
  identifier: z.string().optional(),
  searchText: z.string(),
  keywords: z.array(z.string()),
  locale: z.string().min(2),
  scopeType: searchScopeTypeSchema,
  spaceIds: z.array(z.string()),
  projectIds: z.array(z.string()),
  principalKeys: z.array(z.string()),
  sensitivity: searchSensitivitySchema,
  sourceUpdatedAt: z.number().nonnegative(),
  version: z.number().int().positive(),
  deletedAt: z.number().optional(),
});

export const searchPolicySchema = z.object({
  organizationId: z.string().min(1),
  enabledResourceTypes: z.array(searchResourceTypeSchema),
  attachmentExtractionEnabled: z.boolean(),
  ocrEnabled: z.boolean(),
  externallyIndexRestricted: z.boolean(),
  externallyIndexConfidential: z.boolean(),
  allowedMimeTypes: z.array(z.string()),
  defaultLocale: z.string().min(2),
  fallbackLocales: z.array(z.string().min(2)),
  version: z.number().int().positive(),
});

export type SearchResourceType = z.infer<typeof searchResourceTypeSchema>;
export type SearchScopeType = z.infer<typeof searchScopeTypeSchema>;
export type SearchSensitivity = z.infer<typeof searchSensitivitySchema>;
export type SearchOutboxStatus = z.infer<typeof searchOutboxStatusSchema>;
export type SearchProjection = z.infer<typeof searchProjectionSchema>;
export type SearchPolicy = z.infer<typeof searchPolicySchema>;

export interface SearchCandidate {
  resourceType: SearchResourceType;
  resourceId: string;
  version: number;
  score: number;
  titleSnippet?: string;
  textSnippet?: string;
}

export const hydratedSearchResultSchema = z.object({
  resourceType: searchResourceTypeSchema,
  resourceId: z.string().min(1),
  title: z.string(),
  subtitle: z.string().optional(),
  route: z.string().min(1),
  score: z.number(),
  capabilities: z.object({ canRead: z.boolean(), canUpdate: z.boolean(), canDelete: z.boolean() }),
});

export type HydratedSearchResult = z.infer<typeof hydratedSearchResultSchema>;

export interface SearchQuery {
  organizationId: string;
  text: string;
  principalKeys: string[];
  resourceTypes?: SearchResourceType[];
  locales: string[];
  sensitivity: SearchSensitivity[];
  limit: number;
  offset?: number;
}

export interface SearchProvider {
  upsert(projections: SearchProjection[]): Promise<void>;
  remove(projections: Array<Pick<SearchProjection, "organizationId" | "resourceType" | "resourceId" | "locale">>): Promise<void>;
  search(query: SearchQuery): Promise<SearchCandidate[]>;
}

/** Reserved seam; no vector implementation is selected by the lexical-first release. */
export interface EmbeddingAdapter {
  embed(texts: string[], locale: string): Promise<number[][]>;
}
