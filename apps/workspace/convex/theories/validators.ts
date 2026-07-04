import { v } from "convex/values";

export const theorySourceValidator = v.union(
  v.literal("ai_generated"),
  v.literal("user_created"),
);

export const theoryInputValidator = v.object({
  title: v.string(),
  content: v.string(),
  isPrivate: v.boolean(),
  source: theorySourceValidator,
  category: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
});

export const theoryValidator = v.object({
  _id: v.id("theories"),
  _creationTime: v.number(),
  id: v.string(),
  organizationId: v.string(),
  title: v.string(),
  content: v.string(),
  isPrivate: v.boolean(),
  source: theorySourceValidator,
  category: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  createdByUserId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
});
