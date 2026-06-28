"use client";

import { workspaceFetch } from "@/domains/resources/workspace-resource-request";
import type { OrganizationCapabilities } from "./types";

export function getOrganizationCapabilities(organizationId: string) {
  return workspaceFetch<{ capabilities: OrganizationCapabilities }>(
    organizationId,
    "capabilities",
    { method: "GET", body: undefined, fallbackMessage: "Organization access could not be loaded." },
  ).then((result) => result.capabilities);
}
