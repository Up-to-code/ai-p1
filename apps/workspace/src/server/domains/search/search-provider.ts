import type { SearchProvider } from "@qentrah/domain-contracts";

export type { SearchCandidate, SearchProvider, SearchQuery } from "@qentrah/domain-contracts";

export function searchDocumentKey(organizationId: string, resourceType: string, resourceId: string) {
  return `${organizationId}:${resourceType}:${resourceId}`;
}
