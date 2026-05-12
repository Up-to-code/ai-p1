import type { Context } from "hono";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { OrganizationProfileUpdateError } from "../errors/update-profile-error";
import { updateOrganizationProfile } from "../services/update-profile";
import { updateOrganizationProfileSchema } from "../validation/update-profile.schema";

// The handler stays HTTP-focused: parse, validate, delegate, and shape response.
export async function handleUpdateOrganizationProfile(c: Context) {
  const organizationId = c.req.param("organizationId");
  if (!organizationId) {
    return c.json({ error: "Organization id is required." }, 400);
  }

  const parsed = await validateJsonBody(
    c,
    updateOrganizationProfileSchema,
    "Invalid organization profile payload.",
  );

  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    const profile = await updateOrganizationProfile(organizationId, parsed.data);

    return c.json({ profile });
  } catch (error) {
    const updateError = error as OrganizationProfileUpdateError;
    return c.json({ error: updateError.message }, updateError.status);
  }
}
