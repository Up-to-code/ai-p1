import { query } from "../_generated/server";
import { authComponent } from "../auth";
import { findUserProfile } from "./data";
import { currentUserProfileValidator } from "./validators";

export const getCurrent = query({
  args: {},
  returns: currentUserProfileValidator,
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    const profile = await findUserProfile(ctx, user._id);

    return {
      userId: user._id,
      avatarUrl: profile?.avatarUrl,
      avatarKey: profile?.avatarKey,
      updatedAt: profile?.updatedAt ?? 0,
    };
  },
});
