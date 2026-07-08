import { v } from "convex/values";
import { recordStateValidator } from "../schema/validators";

export const spaceVisibilityValidator = v.union(
  v.literal("private"),
  v.literal("public"),
  v.literal("request_only"),
);

export const spaceProjectVisibilityValidator = v.union(
  v.literal("private"),
  v.literal("space_members"),
  v.literal("organization"),
);

export const spaceInputValidator = v.object({
  name: v.string(),
  description: v.optional(v.string()),
  icon: v.optional(v.string()),
  color: v.optional(v.string()),
  slug: v.string(),
  visibility: spaceVisibilityValidator,
  defaultProjectVisibility: v.optional(spaceProjectVisibilityValidator),
  allowMemberProjectCreation: v.optional(v.boolean()),
});

export const spaceValidator = v.object({
  _id: v.id("spaces"),
  _creationTime: v.number(),
  id: v.string(),
  organizationId: v.string(),
  name: v.string(),
  description: v.optional(v.string()),
  icon: v.optional(v.string()),
  color: v.optional(v.string()),
  slug: v.string(),
  visibility: spaceVisibilityValidator,
  defaultProjectVisibility: v.optional(spaceProjectVisibilityValidator),
  allowMemberProjectCreation: v.optional(v.boolean()),
  recordState: recordStateValidator,
  createdByUserId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
});
