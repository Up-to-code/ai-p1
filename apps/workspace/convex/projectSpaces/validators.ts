import { v } from "convex/values";
import { recordStateValidator } from "../schema/validators";

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
  recordState: recordStateValidator,
  addedByUserId: v.string(),
  addedAt: v.number(),
  deletedAt: v.optional(v.number()),
});
