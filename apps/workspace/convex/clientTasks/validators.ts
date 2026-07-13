import { v } from "convex/values";
import { recordStateValidator } from "../schema/validators";

export const clientTaskStatusValidator = v.string();
export const taskPriorityValidator = v.union(
  v.literal("low"),
  v.literal("normal"),
  v.literal("high"),
  v.literal("urgent"),
);

export const visibilityValidator = v.union(v.literal("private"), v.literal("team"), v.literal("workspace"));

export const checklistItemValidator = v.object({
  id: v.string(),
  title: v.string(),
  done: v.boolean(),
});

export const clientTaskInputValidator = v.object({
  title: v.string(),
  status: clientTaskStatusValidator,
  pipelineOrder: v.optional(v.number()),
  visibility: v.optional(visibilityValidator),
  priority: taskPriorityValidator,
  assigneeUserId: v.optional(v.string()),
  assigneeUserIds: v.optional(v.array(v.string())),
  clientId: v.optional(v.string()),
  projectId: v.optional(v.string()),
  spaceId: v.optional(v.string()),
  startDate: v.optional(v.string()),
  dueDate: v.optional(v.string()),
  description: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  checklist: v.optional(v.array(checklistItemValidator)),
});

export const clientTaskPatchValidator = v.object({
  title: v.optional(v.string()),
  status: v.optional(clientTaskStatusValidator),
  pipelineOrder: v.optional(v.number()),
  visibility: v.optional(visibilityValidator),
  priority: v.optional(taskPriorityValidator),
  assigneeUserId: v.optional(v.string()),
  assigneeUserIds: v.optional(v.array(v.string())),
  clientId: v.optional(v.string()),
  projectId: v.optional(v.string()),
  spaceId: v.optional(v.string()),
  startDate: v.optional(v.string()),
  dueDate: v.optional(v.string()),
  description: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  checklist: v.optional(v.array(checklistItemValidator)),
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
  priority: taskPriorityValidator,
  assigneeUserId: v.optional(v.string()),
  assigneeUserIds: v.optional(v.array(v.string())),
  clientId: v.optional(v.string()),
  projectId: v.optional(v.string()),
  spaceId: v.optional(v.string()),
  startDate: v.optional(v.string()),
  dueDate: v.optional(v.string()),
  description: v.optional(v.string()),
  checklist: v.optional(v.array(checklistItemValidator)),
  tags: v.optional(v.array(v.string())),
  customFields: v.optional(v.array(v.any())),
  recordState: recordStateValidator,
  createdByUserId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
  completedAt: v.optional(v.number()),
});
