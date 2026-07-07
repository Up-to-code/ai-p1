import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "@/server/auth/convex-auth";
import { evaluateOrganizationCapabilities, type OrganizationCapabilities } from "@/packages/authz";
import { getCurrentBetterAuthOrganizationRole } from "@/server/domains/organization/services/better-auth-organization-service";

type OrganizationResource =
  | "organization"
  | "team"
  | "member"
  | "role"
  | "client"
  | "task"
  | "project"
  | "asset"
  | "calendar"
  | "media"
  | "visibility"
  | "integration"
  | "apiKey"
  | "oauthApp";

export async function assertCanUpdateOrganizationProfile(
  organizationId: string,
) {
  const allowed = await fetchAuthQuery(api.organizations.profile.access.canUpdateProfile, {
    organizationId,
  }).then((result) => result.allowed);

  if (!allowed) {
    throw new Error("You do not have permission to update this organization profile.");
  }
}

export async function assertCanUseOrganizationResource(
  organizationId: string,
  resource: OrganizationResource,
  action: string,
) {
  const convexAllowed = await fetchAuthQuery(api.organizations.profile.access.canUseResourceAction, {
    organizationId,
    resource,
    action,
  }).then((result) => result.allowed);

  if (convexAllowed) return;

  const betterAuthAllowed = await canUseBetterAuthOrganizationResource(
    organizationId,
    resource,
    action,
  );

  if (!betterAuthAllowed) {
    throw new Error(`You do not have permission to ${action} this organization ${resource}.`);
  }
}

export async function getOrganizationCapabilities(organizationId: string) {
  const betterAuthRole = await getCurrentBetterAuthOrganizationRole(organizationId);
  if (betterAuthRole) {
    const dynamicRoles = await fetchAuthQuery(api.organizations.workRoles.list, {
      organizationId,
    }).catch(() => []);

    return evaluateOrganizationCapabilities({
      memberRole: betterAuthRole,
      dynamicRoles,
    });
  }

  return fetchAuthQuery(api.organizations.profile.access.getCapabilities, {
    organizationId,
  }) as Promise<OrganizationCapabilities>;
}

async function canUseBetterAuthOrganizationResource(
  organizationId: string,
  resource: OrganizationResource,
  action: string,
) {
  const capabilities = await getOrganizationCapabilities(organizationId);
  const capability = organizationCapabilityFor(resource, action);
  return capability ? capabilities[capability] === true : false;
}

function organizationCapabilityFor(
  resource: OrganizationResource,
  action: string,
): keyof OrganizationCapabilities | null {
  if (resource === "organization" && action === "read") return "canReadOrganization";
  if (resource === "organization" && action === "update") return "canUpdateOrganization";
  if (resource === "member" && action === "create") return "canInviteMembers";
  if (resource === "member" && action === "read") return "canReadOrganization";
  if (resource === "member" && action === "update") return "canUpdateMembers";
  if (resource === "member" && action === "delete") return "canRemoveMembers";
  if (resource === "role" && action === "read") return "canReadRoles";
  if (resource === "role" && action === "create") return "canCreateRoles";
  if (resource === "role" && action === "update") return "canUpdateRoles";
  if (resource === "role" && action === "delete") return "canDeleteRoles";
  if (resource === "project" && action === "read") return "canReadProjects";
  if (resource === "project" && action === "create") return "canCreateProjects";
  if (resource === "project" && action === "update") return "canUpdateProjects";
  if (resource === "project" && action === "delete") return "canDeleteProjects";
  if (resource === "client" && action === "read") return "canReadClients";
  if (resource === "client" && action === "create") return "canCreateClients";
  if (resource === "client" && action === "update") return "canUpdateClients";
  if (resource === "client" && action === "delete") return "canDeleteClients";
  if (resource === "task" && action === "read") return "canReadTasks";
  if (resource === "task" && action === "create") return "canCreateTasks";
  if (resource === "task" && action === "update") return "canUpdateTasks";
  if (resource === "task" && action === "delete") return "canDeleteTasks";
  if (resource === "media" && action === "read") return "canReadMedia";
  if (resource === "media" && action === "create") return "canCreateMedia";
  if (resource === "media" && action === "update") return "canUpdateMedia";
  if (resource === "media" && action === "delete") return "canDeleteMedia";
  if (resource === "apiKey" && action === "read") return "canReadApiKeys";
  if (resource === "apiKey" && action === "create") return "canCreateApiKeys";
  if (resource === "apiKey" && action === "update") return "canUpdateApiKeys";
  if (resource === "apiKey" && action === "delete") return "canDeleteApiKeys";
  if (resource === "calendar" && action === "read") return "canReadCalendarEvents";
  if (resource === "calendar" && action === "create") return "canCreateCalendarEvents";
  if (resource === "calendar" && action === "update") return "canUpdateCalendarEvents";
  if (resource === "calendar" && action === "delete") return "canDeleteCalendarEvents";
  return null;
}
