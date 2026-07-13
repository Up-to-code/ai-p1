import { fetchAuthQuery } from "@/server/auth/auth-request";
import { api } from "@convex/_generated/api";

export async function getOrganizationProfile(organizationId: string) {
  return fetchAuthQuery(api.organizations.profile.read.getProfile, { organizationId });
}
