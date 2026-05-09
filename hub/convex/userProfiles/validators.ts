import { v } from "convex/values";

export const currentUserProfileValidator = v.object({
  userId: v.string(),
  avatarUrl: v.optional(v.string()),
  avatarKey: v.optional(v.string()),
  updatedAt: v.number(),
});

export const updateCurrentUserAvatarInputValidator = v.object({
  avatarUrl: v.optional(v.string()),
  avatarKey: v.optional(v.string()),
});
