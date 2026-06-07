import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "@/server/auth/clerk-convex";
import type { OrganizationCapabilities } from "@/packages/authz";

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
  const allowed = await fetchAuthQuery(api.organizations.profile.access.canUseResourceAction, {
    organizationId,
    resource,
    action,
  }).then((result) => result.allowed);

  if (!allowed) {
    throw new Error(`You do not have permission to ${action} this organization ${resource}.`);
  }
}

export async function getOrganizationCapabilities(organizationId: string) {
  return fetchAuthQuery(api.organizations.profile.access.getCapabilities, {
    organizationId,
  }) as Promise<OrganizationCapabilities>;
}
