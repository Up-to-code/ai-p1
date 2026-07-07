import { fetchAuthQuery } from "@/server/auth/convex-auth";
import { api } from "@convex/_generated/api";

export async function getOrganizationProfile(organizationId: string) {
  return fetchAuthQuery(api.organizations.profile.read.getProfile, { organizationId });
}
