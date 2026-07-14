"use client";

import type { HydratedSearchResult, SearchResourceType, SearchScopeType, SearchSensitivity } from "@qentrah/domain-contracts";
import { useHttpQueryResult } from "@/components/shared/use-http-query";
import { organizationReadPath } from "@/domains/resources/routing";

export function useAuthorizedSearchQuery(
  organizationId: string | undefined,
  search: string,
  options: {
    resourceTypes?: SearchResourceType[]
    scopeTypes?: SearchScopeType[]
    sensitivity?: SearchSensitivity[]
    locales?: string[]
    spaceIds?: string[]
    projectIds?: string[]
    ownerIds?: string[]
    assigneeIds?: string[]
    clientIds?: string[]
    statuses?: string[]
    tagIds?: string[]
    dateFrom?: number
    dateTo?: number
    limit?: number
    offset?: number
  } | SearchResourceType[] = {},
) {
  const normalized = Array.isArray(options) ? { resourceTypes: options } : options;
  const enabled = Boolean(organizationId && search.trim());
  return useHttpQueryResult<HydratedSearchResult[]>(
    ["authorized-search", organizationId, JSON.stringify(normalized)],
    enabled ? organizationReadPath(organizationId!, "search") : undefined,
    {
      search: search.trim(),
      resourceTypes: normalized.resourceTypes?.join(","),
      scopeTypes: normalized.scopeTypes?.join(","),
      sensitivity: normalized.sensitivity?.join(","),
      locales: normalized.locales?.join(","),
      spaceIds: normalized.spaceIds?.join(","),
      projectIds: normalized.projectIds?.join(","),
      ownerIds: normalized.ownerIds?.join(","),
      assigneeIds: normalized.assigneeIds?.join(","),
      clientIds: normalized.clientIds?.join(","),
      statuses: normalized.statuses?.join(","),
      tagIds: normalized.tagIds?.join(","),
      dateFrom: normalized.dateFrom,
      dateTo: normalized.dateTo,
      limit: normalized.limit ?? 10,
      offset: normalized.offset ?? 0,
    },
  );
}
