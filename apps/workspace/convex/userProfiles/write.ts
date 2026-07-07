import { mutation } from "../_generated/server";
import { authUser } from "../auth";
import { findUserProfile } from "./data";
import {
  currentUserProfileValidator,
  updateCurrentUserProfileInputValidator,
  updateCurrentUserAvatarInputValidator,
} from "./validators";

export const updateCurrentUserProfileFromHono = mutation({
  args: {
    input: updateCurrentUserProfileInputValidator,
  },
  returns: currentUserProfileValidator,
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    const now = Date.now();
    const existing = await findUserProfile(ctx, user._id);
    const patch = {
      name: args.input.name,
      phone: args.input.phone,
      role: args.input.role,
      language: args.input.language,
      timezone: args.input.timezone,
      notifications: args.input.notifications,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);

      return {
        userId: user._id,
        avatarUrl: existing.avatarUrl,
        avatarKey: existing.avatarKey,
        ...patch,
      };
    }

    await ctx.db.insert("userProfiles", {
      userId: user._id,
      ...patch,
    });

    return {
      userId: user._id,
      ...patch,
    };
  },
});

export const updateCurrentUserAvatarFromHono = mutation({
  args: {
    input: updateCurrentUserAvatarInputValidator,
  },
  returns: currentUserProfileValidator,
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
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
      name: existing?.name,
      phone: existing?.phone,
      role: existing?.role,
      language: existing?.language,
      timezone: existing?.timezone,
      notifications: existing?.notifications,
      avatarUrl: args.input.avatarUrl,
      avatarKey: args.input.avatarKey,
      updatedAt: now,
    };
  },
});
