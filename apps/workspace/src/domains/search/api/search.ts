"use client";

import type { HydratedSearchResult, SearchResourceType } from "@qentrah/domain-contracts";
import { useHttpQueryResult } from "@/components/shared/use-http-query";
import { organizationReadPath } from "@/domains/resources/routing";

export function useAuthorizedSearchQuery(
  organizationId: string | undefined,
  search: string,
  resourceTypes?: SearchResourceType[],
) {
  const enabled = Boolean(organizationId && search.trim());
  return useHttpQueryResult<HydratedSearchResult[]>(
    ["authorized-search", organizationId, resourceTypes?.join(",")],
    enabled ? organizationReadPath(organizationId!, "search") : undefined,
    { search: search.trim(), resourceTypes: resourceTypes?.join(","), limit: 10 },
  );
}
