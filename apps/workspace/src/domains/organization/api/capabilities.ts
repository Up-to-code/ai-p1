"use client";

import { workspaceFetch } from "@/domains/resources/workspace-resource-request";
import type { OrganizationCapabilities } from "./types";

export function getOrganizationCapabilities(organizationId: string) {
  return requestOrganizationAction<{ capabilities: OrganizationCapabilities }>(
    organizationApiPath(organizationId, "capabilities"),
    "GET",
    undefined,
    "Organization access could not be loaded.",
  ).then((result) => result.capabilities);
}
