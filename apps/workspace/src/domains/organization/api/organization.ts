"use client";

import { workspaceMutation } from "@/domains/resources/workspace-resource-request";

export function updateAuthOrganization(
  organizationId: string,
  data: { name?: string; slug?: string; logo?: string; metadata?: Record<string, unknown> },
) {
  return workspaceMutation<{ organization: unknown }>(
    organizationId,
    "identity",
    { method: "PATCH", body: data, fallbackMessage: "Organization update failed." },
  ).then((result) => result.organization);
}
