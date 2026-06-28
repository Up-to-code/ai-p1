import { v } from "convex/values";

export const milestoneStatusValidator = v.union(
  v.literal("pending"),
  v.literal("inProgress"),
  v.literal("completed"),
  v.literal("delayed"),
  v.literal("cancelled"),
);

export const milestoneInputValidator = v.object({
  title: v.string(),
  description: v.optional(v.string()),
  status: milestoneStatusValidator,
  dueDate: v.optional(v.number()),
  order: v.number(),
  tags: v.optional(v.array(v.string())),
});

export const milestoneValidator = v.object({
  _id: v.id("milestones"),
  _creationTime: v.number(),
  id: v.string(),
  workspaceId: v.id("workspaces"),
  projectId: v.id("projects"),
  spaceId: v.optional(v.id("spaces")),
  title: v.string(),
  description: v.optional(v.string()),
  status: milestoneStatusValidator,
  dueDate: v.optional(v.number()),
  completedAt: v.optional(v.number()),
  order: v.number(),
  tags: v.optional(v.array(v.string())),
  createdByUserId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
});
