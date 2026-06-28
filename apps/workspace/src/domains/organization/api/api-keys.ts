"use client";

import { workspaceFetch, workspaceMutation } from "@/domains/resources/workspace-resource-request";
import type { OrganizationApiKey, OrganizationApiKeyPermission, OrganizationApiKeyExpiry } from "./types";

export function listOrganizationApiKeys(organizationId: string) {
  return workspaceFetch<{ keys: OrganizationApiKey[] }>(
    organizationId,
    "api-keys",
    { method: "GET", body: undefined, fallbackMessage: "API keys could not be loaded." },
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
  return workspaceMutation<{ key: OrganizationApiKey; apiKey: string }>(
    organizationId,
    "api-keys",
    { method: "POST", body: input, fallbackMessage: "API key could not be created." },
  );
}

export function rotateOrganizationApiKey(
  organizationId: string,
  apiKeyId: string,
  input: { expiry: OrganizationApiKeyExpiry },
) {
  return workspaceMutation<{ key: OrganizationApiKey; apiKey: string }>(
    organizationId,
    `api-keys/${apiKeyId}/rotate`,
    { method: "POST", body: input, fallbackMessage: "API key could not be rotated." },
  );
}

export function revokeOrganizationApiKey(organizationId: string, apiKeyId: string) {
  return workspaceMutation<{ revoked: boolean }>(
    organizationId,
    `api-keys/${apiKeyId}`,
    { method: "DELETE", body: undefined, fallbackMessage: "API key could not be revoked." },
  );
}
