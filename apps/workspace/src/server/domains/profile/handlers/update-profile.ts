import type { Context } from "hono";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { updateCurrentUserProfile } from "../services/update-profile";
import { updateProfileSchema } from "../validation/update-profile.schema";

export async function handleUpdateCurrentUserProfile(c: Context) {
  const parsed = await validateJsonBody(
    c,
    updateProfileSchema,
    "Invalid profile payload.",
  );

  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    const profile = await updateCurrentUserProfile(parsed.data);

    return c.json({ profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Profile update failed.";
    return c.json({ error: message }, 500);
  }
}
