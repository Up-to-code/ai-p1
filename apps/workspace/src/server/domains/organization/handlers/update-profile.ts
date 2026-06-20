import type { Context } from "hono";
import { requireOrganizationId } from "@/server/utils/organization/require-organization-id";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { actionErrorJson } from "@/server/utils/response/action-error";
import { updateOrganizationProfile } from "../services/update-profile";
import { updateOrganizationProfileSchema } from "../validation/update-profile.schema";

export async function handleUpdateOrganizationProfile(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;

  const parsed = await validateJsonBody(
    c,
    updateOrganizationProfileSchema,
    "Invalid organization profile payload.",
  );

  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    const profile = await updateOrganizationProfile(org.organizationId, parsed.data);
    return c.json({ profile });
  } catch (error) {
    return actionErrorJson(c, error, "Organization profile update failed.");
  }
}
