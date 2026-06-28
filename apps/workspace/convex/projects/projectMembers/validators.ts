import { v } from "convex/values";

export const projectMemberRoleValidator = v.union(
  v.literal("manager"),
  v.literal("editor"),
  v.literal("viewer"),
  v.literal("guest"),
);

export const projectMemberInputValidator = v.object({
  userId: v.string(),
  role: projectMemberRoleValidator,
});

export const projectMemberValidator = v.object({
  _id: v.id("projectMembers"),
  _creationTime: v.number(),
  id: v.string(),
  projectId: v.id("projects"),
  workspaceId: v.id("workspaces"),
  userId: v.string(),
  role: projectMemberRoleValidator,
  addedAt: v.number(),
  addedByUserId: v.string(),
  deletedAt: v.optional(v.number()),
});
