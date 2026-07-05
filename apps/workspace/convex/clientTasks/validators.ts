import { v } from "convex/values";
import { clientPriorityValidator } from "../clients/validators";

export const clientTaskStatusValidator = v.union(
  v.literal("todo"),
  v.literal("inProgress"),
  v.literal("waiting"),
  v.literal("done"),
  v.literal("canceled"),
);

export const visibilityValidator = v.union(v.literal("private"), v.literal("team"), v.literal("workspace"));

export const clientTaskInputValidator = v.object({
  title: v.string(),
  status: clientTaskStatusValidator,
  pipelineOrder: v.optional(v.number()),
  visibility: v.optional(visibilityValidator),
  priority: clientPriorityValidator,
  assigneeUserId: v.optional(v.string()),
  clientId: v.optional(v.string()),
  projectId: v.optional(v.string()),
  spaceId: v.optional(v.string()),
  dueDate: v.optional(v.string()),
  description: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
});

export const clientTaskValidator = v.object({
  _id: v.id("tasks"),
  _creationTime: v.number(),
  id: v.string(),
  organizationId: v.string(),
  title: v.string(),
  status: clientTaskStatusValidator,
  pipelineOrder: v.optional(v.number()),
  visibility: visibilityValidator,
  priority: clientPriorityValidator,
  assigneeUserId: v.optional(v.string()),
  clientId: v.optional(v.string()),
  projectId: v.optional(v.string()),
  spaceId: v.optional(v.string()),
  dueDate: v.optional(v.string()),
  description: v.optional(v.string()),
  checklist: v.optional(v.array(v.object({
    id: v.string(),
    title: v.string(),
    done: v.boolean(),
  }))),
  tags: v.optional(v.array(v.string())),
  customFields: v.optional(v.array(v.any())),
  createdByUserId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
  completedAt: v.optional(v.number()),
});
