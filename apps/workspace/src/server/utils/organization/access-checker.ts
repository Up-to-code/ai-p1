import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "@/server/auth/better-auth/server";
import type { OrganizationCapabilities } from "@/packages/authz";

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
  return fetchAuthQuery(api.organizations.profile.access.getCapabilities, {
    organizationId,
  }) as Promise<OrganizationCapabilities>;
}
