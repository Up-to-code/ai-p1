import { z } from "zod";
import { expiryTimestamp } from "@/lib/utils/expiry-timestamp";

const organizationApiKeyResourceSchema = z.enum([
  "organization",
  "client",
  "project",
  "calendar",
  "task",
  "media",
]);

const organizationApiKeyActionSchema = z.enum(["read", "create", "update", "delete"]);

const organizationApiKeyPermissionSchema = z.object({
  resource: organizationApiKeyResourceSchema,
  actions: z.array(organizationApiKeyActionSchema).min(1),
});

const organizationApiKeyExpirySchema = z.enum(["5h", "14d", "30d", "never"]);

export const createOrganizationApiKeySchema = z.object({
  name: z.string().trim().min(1).max(120),
  permissions: z.array(organizationApiKeyPermissionSchema).min(1),
  expiry: organizationApiKeyExpirySchema.default("30d"),
});

export const rotateOrganizationApiKeySchema = z.object({
  expiry: organizationApiKeyExpirySchema.default("30d"),
});

export type OrganizationApiKeyResource = z.infer<typeof organizationApiKeyResourceSchema>;
export type OrganizationApiKeyAction = z.infer<typeof organizationApiKeyActionSchema>;
export type OrganizationApiKeyPermission = z.infer<typeof organizationApiKeyPermissionSchema>;
export type OrganizationApiKeyExpiry = z.infer<typeof organizationApiKeyExpirySchema>;
export type CreateOrganizationApiKeyPayload = z.infer<typeof createOrganizationApiKeySchema>;
export type RotateOrganizationApiKeyPayload = z.infer<typeof rotateOrganizationApiKeySchema>;

export function organizationApiKeyExpiresAt(expiry: OrganizationApiKeyExpiry, now = Date.now()) {
  return expiryTimestamp(expiry, now);
}

export function normalizeOrganizationApiKeyPermissions(
  permissions: OrganizationApiKeyPermission[],
) {
  const byResource = new Map<OrganizationApiKeyResource, Set<OrganizationApiKeyAction>>();
  for (const permission of permissions) {
    const actions = byResource.get(permission.resource) ?? new Set<OrganizationApiKeyAction>();
    for (const action of permission.actions) {
      if (permission.resource !== "client" && action !== "read") {
        throw new Error("Only client API keys can create, update, or delete records in v1.");
      }
      actions.add(action);
    }
    byResource.set(permission.resource, actions);
  }

  return Array.from(byResource.entries())
    .map(([resource, actions]) => ({ resource, actions: Array.from(actions).sort() }))
    .sort((left, right) => left.resource.localeCompare(right.resource));
}
