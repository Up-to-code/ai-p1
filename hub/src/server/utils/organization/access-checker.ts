import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "@/server/auth/better-auth/server";

type OrganizationResource =
  | "organization"
  | "team"
  | "member"
  | "role"
  | "client"
  | "project"
  | "property"
  | "calendar"
  | "integration"
  | "apiKey"
  | "oauthApp";

export async function assertCanUpdateOrganizationProfile(
  organizationId: string,
) {
  await fetchAuthQuery(api.organizations.profile.access.canUpdateProfile, {
    organizationId,
  });
}

export async function assertCanUseOrganizationResource(
  organizationId: string,
  resource: OrganizationResource,
  action: string,
) {
  await fetchAuthQuery(api.organizations.profile.access.canUseResourceAction, {
    organizationId,
    resource,
    action,
  });
}

export async function getOrganizationCapabilities(organizationId: string) {
  const checks = {
    canUpdateOrganization: ["organization", "update"],
    canInviteMembers: ["member", "create"],
    canUpdateMembers: ["member", "update"],
    canRemoveMembers: ["member", "delete"],
    canReadRoles: ["role", "read"],
    canCreateRoles: ["role", "create"],
    canUpdateRoles: ["role", "update"],
    canDeleteRoles: ["role", "delete"],
    canCreateProjects: ["project", "create"],
    canUpdateProjects: ["project", "update"],
    canDeleteProjects: ["project", "delete"],
    canCreateProperties: ["property", "create"],
    canUpdateProperties: ["property", "update"],
    canDeleteProperties: ["property", "delete"],
  } as const;

  const entries = await Promise.all(
    Object.entries(checks).map(async ([key, [resource, action]]) => {
      try {
        await assertCanUseOrganizationResource(organizationId, resource, action);
        return [key, true] as const;
      } catch {
        return [key, false] as const;
      }
    }),
  );

  return Object.fromEntries(entries) as Record<keyof typeof checks, boolean>;
}
