"use client";

import { workspaceMutation } from "@/domains/resources/workspace-resource-request";

export function updateAuthOrganization(
  organizationId: string,
  data: { name?: string; slug?: string; logo?: string; metadata?: Record<string, unknown> },
) {
  return requestOrganizationAction<{ organization: unknown }>(
    organizationApiPath(organizationId, "identity"),
    "PATCH",
    data,
    "Organization update failed.",
  ).then((result) => result.organization);
}
