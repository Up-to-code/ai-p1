import { v } from "convex/values";

export const currentUserProfileValidator = v.object({
  userId: v.string(),
  name: v.optional(v.string()),
  phone: v.optional(v.string()),
  role: v.optional(v.string()),
  language: v.optional(v.union(v.literal("en"), v.literal("ar"))),
  timezone: v.optional(v.string()),
  notifications: v.optional(v.object({
    product: v.boolean(),
    approvals: v.boolean(),
    billing: v.boolean(),
    security: v.boolean(),
  })),
  avatarUrl: v.optional(v.string()),
  avatarKey: v.optional(v.string()),
  updatedAt: v.number(),
});

export const updateCurrentUserProfileInputValidator = v.object({
  name: v.string(),
  phone: v.optional(v.string()),
  role: v.string(),
  language: v.union(v.literal("en"), v.literal("ar")),
  timezone: v.string(),
  notifications: v.object({
    product: v.boolean(),
    approvals: v.boolean(),
    billing: v.boolean(),
    security: v.boolean(),
  }),
});

export const updateCurrentUserAvatarInputValidator = v.object({
  avatarUrl: v.optional(v.string()),
  avatarKey: v.optional(v.string()),
});
