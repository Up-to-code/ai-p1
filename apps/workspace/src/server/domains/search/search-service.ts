import type { HydratedSearchResult, SearchProvider, SearchResourceType } from "@qentrah/domain-contracts";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "@/server/auth/auth-request";
import type { SearchGatewayQuery } from "./validation/search-query.schema";

type SearchAccessContext = {
  principalKeys: string[];
  locales: string[];
  resourceTypes: SearchResourceType[];
  sensitivity: Array<"standard" | "restricted" | "confidential">;
  policyVersion: number;
};

export async function searchAuthorizedResources(
  provider: SearchProvider,
  organizationId: string,
  input: SearchGatewayQuery,
): Promise<HydratedSearchResult[]> {
  const access = await fetchAuthQuery(api.search.accessContext.resolve, { organizationId }) as SearchAccessContext;
  const requested = input.resourceTypes?.length ? input.resourceTypes : access.resourceTypes;
  const resourceTypes = requested.filter((type) => access.resourceTypes.includes(type));
  if (!resourceTypes.length) return [];
  const locales = input.locales?.length ? input.locales.filter((locale) => access.locales.includes(locale)) : access.locales;
  const sensitivity = input.sensitivity?.length ? input.sensitivity.filter((value) => access.sensitivity.includes(value)) : access.sensitivity;
  if (!locales.length || !sensitivity.length) return [];
  const candidates = await provider.search({
    organizationId,
    text: input.search,
    principalKeys: access.principalKeys,
    resourceTypes,
    locales,
    sensitivity,
    scopeTypes: input.scopeTypes,
    spaceIds: input.spaceIds,
    projectIds: input.projectIds,
    ownerIds: input.ownerIds,
    assigneeIds: input.assigneeIds,
    clientIds: input.clientIds,
    statuses: input.statuses,
    tagIds: input.tagIds,
    dateFrom: input.dateFrom,
    dateTo: input.dateTo,
    limit: Math.min(input.limit * 3, 50),
    offset: input.offset,
  });
  const hydrated = await fetchAuthQuery(api.search.hydrate.candidates, {
    organizationId,
    candidates: candidates.map(({ resourceType, resourceId, version, score }) => ({ resourceType, resourceId, version, score })),
  }) as HydratedSearchResult[];
  return hydrated.slice(0, input.limit);
}
