import type { Context } from "hono";
import { requireOrganizationId } from "@/server/utils/organization/require-organization-id";
import { getOrganizationProfile } from "../services/get-profile";

export async function handleGetOrganizationProfile(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;

  try {
    const profile = await getOrganizationProfile(org.organizationId);
    return c.json({ profile });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to load organization profile." }, 500);
  }
}
