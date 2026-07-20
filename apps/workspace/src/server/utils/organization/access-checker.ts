import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "@/server/auth/auth-request";
import { evaluateOrganizationCapabilities, type OrganizationCapabilities } from "@/packages/authz";
import { getCurrentBetterAuthOrganizationRole } from "@/server/domains/organization/services/better-auth-organization-service";
import { organizationCapabilityChecks, type Resource } from "@qentrah/domain-contracts";

type OrganizationResource = Resource;

/** Reverse-lookup: given a (resource, action) pair, return the matching capability key. */
const capabilityReverseMap = new Map<string, keyof OrganizationCapabilities>(
  Object.entries(organizationCapabilityChecks).map(([key, { resource, action }]) => [
    `${resource}:${action}`,
    key as keyof OrganizationCapabilities,
  ]),
);

function organizationCapabilityFor(
  resource: OrganizationResource,
  action: string,
): keyof OrganizationCapabilities | null {
  return capabilityReverseMap.get(`${resource}:${action}`) ?? null;
}

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
