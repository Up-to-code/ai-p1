import { mutation } from "../_generated/server";
import { authComponent } from "../auth";
import { findUserProfile } from "./data";
import {
  currentUserProfileValidator,
  updateCurrentUserAvatarInputValidator,
} from "./validators";

export const updateCurrentUserAvatarFromHono = mutation({
  args: {
    input: updateCurrentUserAvatarInputValidator,
  },
  returns: currentUserProfileValidator,
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    const now = Date.now();
    const existing = await findUserProfile(ctx, user._id);

    if (existing) {
      await ctx.db.patch(existing._id, {
        avatarUrl: args.input.avatarUrl,
        avatarKey: args.input.avatarKey,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("userProfiles", {
        userId: user._id,
        avatarUrl: args.input.avatarUrl,
        avatarKey: args.input.avatarKey,
        updatedAt: now,
      });
    }

    return {
      userId: user._id,
      avatarUrl: args.input.avatarUrl,
      avatarKey: args.input.avatarKey,
      updatedAt: now,
    };
  },
});
