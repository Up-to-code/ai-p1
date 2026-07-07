"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getOrganizationCapabilities,
  listOrganizationMembers,
} from "@/domains/organization/api";
import { topbarShareQueryKeys } from "../config/share.config";

/** Loads organization members and capabilities for the topbar share popover. */
export function useTopbarShareQueries(organizationId: string | undefined) {
  const membersQuery = useQuery({
    queryKey: topbarShareQueryKeys.members(organizationId ?? ""),
    queryFn: () => listOrganizationMembers(organizationId ?? ""),
    enabled: Boolean(organizationId),
  });

  const capabilitiesQuery = useQuery({
    queryKey: topbarShareQueryKeys.capabilities(organizationId ?? ""),
    queryFn: () => getOrganizationCapabilities(organizationId ?? ""),
    enabled: Boolean(organizationId),
  });

  return { membersQuery, capabilitiesQuery };
}
