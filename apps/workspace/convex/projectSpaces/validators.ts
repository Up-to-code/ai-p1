import { v } from "convex/values";

export const spaceVisibilityValidator = v.union(
  v.literal("all_members"),
  v.literal("selected_members"),
);

export const spaceInputValidator = v.object({
  name: v.string(),
  icon: v.optional(v.string()),
  color: v.optional(v.string()),
  visibility: spaceVisibilityValidator,
  defaultAssigneeIds: v.optional(v.array(v.string())),
  slug: v.string(),
});

export const spaceValidator = v.object({
  _id: v.id("projectSpaces"),
  _creationTime: v.number(),
  id: v.string(),
  organizationId: v.string(),
  projectId: v.id("projects"),
  name: v.string(),
  icon: v.optional(v.string()),
  color: v.optional(v.string()),
  visibility: spaceVisibilityValidator,
  defaultAssigneeIds: v.optional(v.array(v.string())),
  slug: v.string(),
  createdByUserId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
});
