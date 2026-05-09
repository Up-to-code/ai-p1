import { apiClient } from "@/lib/api/client";
import type { OrganizationProfile } from "../store/organization.types";
import type { UpdateOrganizationProfileValues } from "../validation/organization.schema";

interface UpdateOrganizationProfileResponse {
  profile: OrganizationProfile;
}

// Frontend writes go through Hono so business authorization never lives in UI code.
export async function updateOrganizationProfileRequest(
  organizationId: string,
  input: UpdateOrganizationProfileValues,
) {
  const response = await apiClient.api.v1.organizations[
    ":organizationId"
  ].profile.$patch({
    param: { organizationId },
    json: input,
  });

  if (!response.ok) {
    const payload = (await response.json()) as { error: string };
    throw new Error(payload.error);
  }

  const payload = (await response.json()) as UpdateOrganizationProfileResponse;
  return payload.profile;
}
