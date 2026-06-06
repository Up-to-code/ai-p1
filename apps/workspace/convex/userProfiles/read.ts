import { query } from "../_generated/server";
import { findUserProfile } from "./data";
import { currentUserProfileValidator } from "./validators";

export const getCurrent = query({
  args: {},
  returns: currentUserProfileValidator,
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject ?? "";
    const profile = userId ? await findUserProfile(ctx, userId) : null;

    return {
      userId,
      name: profile?.name,
      phone: profile?.phone,
      role: profile?.role,
      language: profile?.language,
      timezone: profile?.timezone,
      notifications: profile?.notifications,
      avatarUrl: profile?.avatarUrl,
      avatarKey: profile?.avatarKey,
      updatedAt: profile?.updatedAt ?? 0,
    };
  },
});
