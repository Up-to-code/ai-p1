import type { Context } from "hono";
import { getOrganizationProfile } from "../services/get-profile";

export async function handleGetOrganizationProfile(c: Context) {
  const organizationId = c.req.param("organizationId");
  if (!organizationId) {
    return c.json({ error: "Organization id is required." }, 400);
  }

  try {
    const profile = await getOrganizationProfile(organizationId);
    return c.json({ profile });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to load organization profile." }, 500);
  }
}
