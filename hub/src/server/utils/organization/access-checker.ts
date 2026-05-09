import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "@/server/auth/better-auth/server";

export async function assertCanUpdateOrganizationProfile(
  organizationId: string,
) {
  await fetchAuthQuery(api.organizations.profile.access.canUpdateProfile, {
    organizationId,
  });
}
