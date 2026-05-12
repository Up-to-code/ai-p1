import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "@/server/auth/better-auth/server";

type OrganizationResource =
  | "organization"
  | "team"
  | "member"
  | "role"
  | "client"
  | "task"
  | "project"
  | "property"
  | "calendar"
  | "media"
  | "visibility"
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
    canReadOrganization: ["organization", "read"],
    canUpdateOrganization: ["organization", "update"],
    canInviteMembers: ["member", "create"],
    canUpdateMembers: ["member", "update"],
    canRemoveMembers: ["member", "delete"],
    canReadRoles: ["role", "read"],
    canCreateRoles: ["role", "create"],
    canUpdateRoles: ["role", "update"],
    canDeleteRoles: ["role", "delete"],
    canReadProjects: ["project", "read"],
    canCreateProjects: ["project", "create"],
    canUpdateProjects: ["project", "update"],
    canDeleteProjects: ["project", "delete"],
    canReadProperties: ["property", "read"],
    canCreateProperties: ["property", "create"],
    canUpdateProperties: ["property", "update"],
    canDeleteProperties: ["property", "delete"],
    canReadClients: ["client", "read"],
    canCreateClients: ["client", "create"],
    canUpdateClients: ["client", "update"],
    canDeleteClients: ["client", "delete"],
    canReadTasks: ["task", "read"],
    canCreateTasks: ["task", "create"],
    canUpdateTasks: ["task", "update"],
    canDeleteTasks: ["task", "delete"],
    canReadMedia: ["media", "read"],
    canCreateMedia: ["media", "create"],
    canUpdateMedia: ["media", "update"],
    canDeleteMedia: ["media", "delete"],
    canReadApiKeys: ["apiKey", "read"],
    canCreateApiKeys: ["apiKey", "create"],
    canDeleteApiKeys: ["apiKey", "delete"],
    canReadCalendarEvents: ["calendar", "read"],
    canCreateCalendarEvents: ["calendar", "create"],
    canUpdateCalendarEvents: ["calendar", "update"],
    canDeleteCalendarEvents: ["calendar", "delete"],
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
  const isPlatformAdmin = await fetchAuthQuery(api.platform.access.canUsePlatformAdminAction, {})
    .then(() => true)
    .catch(() => false);

  return {
    ...Object.fromEntries(entries),
    isPlatformAdmin,
    canManageVisibility: isPlatformAdmin,
  } as Record<keyof typeof checks, boolean> & {
    isPlatformAdmin: boolean;
    canManageVisibility: boolean;
  };
}
