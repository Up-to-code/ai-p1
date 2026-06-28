import { workspaceMutation } from "@/domains/resources/workspace-resource-request";
import type { UpdateOrganizationProfileValues } from "../validation/organization.schema";

type OrganizationProfile = {
  organizationId: string;
  name: string;
  legalName: string;
  type: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  logo?: string;
  updatedAt: number;
};

type UpdateOrganizationProfileResponse = {
  profile: OrganizationProfile;
};

// Frontend writes go through Hono so business authorization never lives in UI code.
export async function updateOrganizationProfileRequest(
  organizationId: string,
  input: UpdateOrganizationProfileValues,
) {
  return requestOrganizationAction<UpdateOrganizationProfileResponse>(
    organizationApiPath(organizationId, "profile"),
    "PATCH",
    input,
    "Organization profile update failed.",
  ).then((payload) => payload.profile);
}
