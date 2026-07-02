import { v } from "convex/values";

export const projectSpaceInputValidator = v.object({
  spaceId: v.id("spaces"),
  isPrimary: v.optional(v.boolean()),
});

export const projectSpaceValidator = v.object({
  _id: v.id("projectSpaces"),
  _creationTime: v.number(),
  organizationId: v.string(),
  projectId: v.id("projects"),
  spaceId: v.id("spaces"),
  isPrimary: v.boolean(),
  addedByUserId: v.string(),
  addedAt: v.number(),
  deletedAt: v.optional(v.number()),
});
