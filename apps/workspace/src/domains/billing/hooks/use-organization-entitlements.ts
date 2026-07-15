"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export function useOrganizationEntitlements(organizationId?: string | null) {
  return useQuery(
    api.billing.access.getOrganizationEntitlements,
    organizationId ? { organizationId } : "skip",
  );
}
