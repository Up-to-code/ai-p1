import type { Context } from "hono";
import { updateCurrentUserAvatar } from "../services/update-avatar";
import { updateProfileAvatarSchema } from "../validation/update-avatar.schema";

export async function handleUpdateCurrentUserAvatar(c: Context) {
  const body = await c.req.json().catch(() => null);
  const parsed = updateProfileAvatarSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Invalid profile avatar payload." }, 400);
  }

  try {
    const profile = await updateCurrentUserAvatar(parsed.data);
    return c.json({ profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Profile avatar update failed.";
    return c.json({ error: message }, 500);
  }
}
