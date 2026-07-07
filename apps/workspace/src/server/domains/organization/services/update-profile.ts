import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "@/server/auth/convex-auth";
import { assertCanUpdateOrganizationProfile } from "@/server/utils/organization/access-checker";
import { OrganizationProfileUpdateError } from "../errors/update-profile-error";
import type { UpdateOrganizationProfileInput } from "../validation/update-profile.schema";

// Hono services own write orchestration before Convex persists audited state.
export async function updateOrganizationProfile(
  organizationId: string,
  input: UpdateOrganizationProfileInput,
) {
  await assertCanUpdateOrganizationProfile(organizationId).catch((error: Error) => {
    throw new OrganizationProfileUpdateError(error.message, 403);
  });

  return fetchAuthMutation(api.organizations.profile.write.updateProfileFromHono, {
    organizationId,
    input,
  }).catch((error: Error) => {
    throw new OrganizationProfileUpdateError(error.message, 500);
  });
}
