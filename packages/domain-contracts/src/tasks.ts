import { z } from "zod";
import { visibilitySchema } from "./clients";

export const taskPrioritySchema = z.enum(["low", "normal", "high", "urgent"]);
// Workflow stages are organization-configurable. The five built-ins remain the
// defaults, but persisted tasks may use any non-empty stage key.
export const taskStatusSchema = z.string().trim().min(1, "Status is required");

export const checklistItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  done: z.boolean(),
});

export const taskInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  status: taskStatusSchema,
  pipelineOrder: z.number().optional(),
  priority: taskPrioritySchema,
  visibility: visibilitySchema.optional(),
  assigneeUserId: z.string().optional(),
  assigneeUserIds: z.array(z.string()).optional(),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  spaceId: z.string().optional(),
  dueDate: z.string().trim().optional(),
  description: z.string().trim().optional(),
  tags: z.array(z.string().trim()).optional(),
  checklist: z.array(checklistItemSchema).optional(),
});

export const taskRecordSchema = z.object({
  _id: z.string(),
  _creationTime: z.number(),
  id: z.string(),
  organizationId: z.string(),
  title: z.string(),
  status: taskStatusSchema,
  pipelineOrder: z.number().optional(),
  priority: taskPrioritySchema,
  visibility: visibilitySchema.optional(),
  assigneeUserId: z.string().optional(),
  assigneeUserIds: z.array(z.string()).optional(),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  spaceId: z.string().optional(),
  dueDate: z.string().optional(),
  description: z.string().optional(),
  checklist: z.array(checklistItemSchema).optional(),
  tags: z.array(z.string()).optional(),
  customFields: z.array(z.object({ key: z.string(), value: z.unknown() })).optional(),
  createdByUserId: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  completedAt: z.number().optional(),
  deletedAt: z.number().optional(),
});

export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;
export type ChecklistItem = z.infer<typeof checklistItemSchema>;
export type TaskInput = z.infer<typeof taskInputSchema>;
export type TaskRecord = z.infer<typeof taskRecordSchema>;

export type TaskSummary = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: string;
  assigneeUserId?: string;
  assigneeUserIds?: string[];
  clientId?: string;
  projectId?: string;
  dueDate?: string;
  tags?: string[];
  createdAt: number;
};
