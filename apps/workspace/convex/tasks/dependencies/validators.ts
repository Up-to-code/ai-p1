import { v } from "convex/values";

export const dependencyTypeValidator = v.union(
  v.literal("depends_on"),
  v.literal("blocks"),
  v.literal("relates_to"),
  v.literal("duplicates"),
);

export const taskDependencyInputValidator = v.object({
  sourceTaskId: v.id("tasks"),
  targetTaskId: v.id("tasks"),
  dependencyType: dependencyTypeValidator,
});

export const taskDependencyValidator = v.object({
  _id: v.id("taskDependencies"),
  _creationTime: v.number(),
  id: v.string(),
  workspaceId: v.id("workspaces"),
  projectId: v.optional(v.id("projects")),
  sourceTaskId: v.id("tasks"),
  targetTaskId: v.id("tasks"),
  dependencyType: dependencyTypeValidator,
  createdByUserId: v.string(),
  createdAt: v.number(),
  deletedAt: v.optional(v.number()),
});
