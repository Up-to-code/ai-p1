import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { fetchAuthMutation, fetchAuthQuery } from "@/server/auth/auth-request";
import {
  normalizeOrganizationApiKeyPermissions,
  organizationApiKeyExpiresAt,
  type CreateOrganizationApiKeyPayload,
  type RotateOrganizationApiKeyPayload,
} from "../validation/api-key.schema";

export function listOrganizationApiKeys(organizationId: string) {
  return fetchAuthQuery(api.organizationApiKeys.list, { organizationId });
}

export function createOrganizationApiKey(
  organizationId: string,
  input: CreateOrganizationApiKeyPayload,
) {
  return fetchAuthMutation(api.organizationApiKeys.createFromHono, {
    organizationId,
    input: {
      name: input.name,
      permissions: normalizeOrganizationApiKeyPermissions(input.permissions),
      expiresAt: organizationApiKeyExpiresAt(input.expiry),
    },
  });
}

export function rotateOrganizationApiKey(
  organizationId: string,
  apiKeyId: string,
  input: RotateOrganizationApiKeyPayload,
) {
  return fetchAuthMutation(api.organizationApiKeys.rotateFromHono, {
    organizationId,
    apiKeyId: apiKeyId as Id<"organizationApiKeys">,
    input: {
      expiresAt: organizationApiKeyExpiresAt(input.expiry),
    },
  });
}

export function revokeOrganizationApiKey(organizationId: string, apiKeyId: string) {
  return fetchAuthMutation(api.organizationApiKeys.revokeFromHono, {
    organizationId,
    apiKeyId: apiKeyId as Id<"organizationApiKeys">,
  });
}
