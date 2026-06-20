import type { Context } from "hono";
import { requireOrganizationId } from "@/server/utils/organization/require-organization-id";
import { actionErrorJson } from "@/server/utils/response/action-error";
import { getOrganizationProfile } from "../services/get-profile";

export async function handleGetOrganizationProfile(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;

  try {
    const profile = await getOrganizationProfile(org.organizationId);
    return c.json({ profile });
  } catch (error) {
    return actionErrorJson(c, error, "Unable to load organization profile.");
  }
}
