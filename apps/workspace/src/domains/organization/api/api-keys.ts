"use client";

import { workspaceMutation } from "@/domains/resources/workspace-resource-request";
import type { OrganizationApiKey, OrganizationApiKeyPermission, OrganizationApiKeyExpiry } from "./types";

export function listOrganizationApiKeys(organizationId: string) {
  return requestOrganizationAction<{ keys: OrganizationApiKey[] }>(
    organizationApiPath(organizationId, "api-keys"),
    "GET",
    undefined,
    "API keys could not be loaded.",
  ).then((result) => result.keys);
}

export function createOrganizationApiKey(
  organizationId: string,
  input: {
    name: string;
    permissions: OrganizationApiKeyPermission[];
    expiry: OrganizationApiKeyExpiry;
  },
) {
  return requestOrganizationAction<{ key: OrganizationApiKey; apiKey: string }>(
    organizationApiPath(organizationId, "api-keys"),
    "POST",
    input,
    "API key could not be created.",
  );
}

export function rotateOrganizationApiKey(
  organizationId: string,
  apiKeyId: string,
  input: { expiry: OrganizationApiKeyExpiry },
) {
  return requestOrganizationAction<{ key: OrganizationApiKey; apiKey: string }>(
    organizationApiPath(organizationId, "api-keys", apiKeyId, "rotate"),
    "POST",
    input,
    "API key could not be rotated.",
  );
}

export function revokeOrganizationApiKey(organizationId: string, apiKeyId: string) {
  return requestOrganizationAction<{ revoked: boolean }>(
    organizationApiPath(organizationId, "api-keys", apiKeyId),
    "DELETE",
    undefined,
    "API key could not be revoked.",
  );
}
