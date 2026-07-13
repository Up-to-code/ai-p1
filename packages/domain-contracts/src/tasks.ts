import { z } from "zod";
import { visibilitySchema } from "./clients";

export const taskPrioritySchema = z.enum(["low", "normal", "high", "urgent"]);
// Workflow stages are organization-configurable. The five built-ins remain the
// defaults, but persisted tasks may use any non-empty stage key.
export const taskStatusSchema = z.string().trim().min(1, "Status is required");
const optionalTaskText = z.string().trim().optional().transform((value) => value || undefined);

export type TaskVisibility = z.infer<typeof visibilitySchema>;

/**
 * Resolves the persisted Task visibility when a caller does not make an
 * explicit privacy choice. Organization-level Tasks are collaborative by
 * default; Tasks linked to a Space or Project inherit that team's boundary.
 */
export function defaultTaskVisibility(
  requestedVisibility: TaskVisibility | undefined,
  projectId?: string,
  spaceId?: string,
): TaskVisibility {
  if (requestedVisibility === "private" || requestedVisibility === "workspace") {
    return requestedVisibility;
  }
  if (requestedVisibility === "team") {
    return projectId || spaceId ? "team" : "workspace";
  }
  return projectId || spaceId ? "team" : "workspace";
}

export const checklistItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  done: z.boolean(),
}).strict();

export const taskInputObjectSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  status: taskStatusSchema,
  pipelineOrder: z.number().optional(),
  priority: taskPrioritySchema,
  visibility: visibilitySchema.optional(),
  assigneeUserId: optionalTaskText,
  assigneeUserIds: z.array(z.string()).optional(),
  clientId: optionalTaskText,
  projectId: optionalTaskText,
  spaceId: optionalTaskText,
  startDate: optionalTaskText,
  dueDate: optionalTaskText,
  description: optionalTaskText,
  tags: z.array(z.string().trim()).optional(),
  checklist: z.array(checklistItemSchema).optional(),
}).strict();

export const taskInputSchema = taskInputObjectSchema;
export const taskPatchObjectSchema = taskInputObjectSchema.partial();
export const taskPatchSchema = taskPatchObjectSchema.refine(
  (patch) => Object.keys(patch).length > 0,
  "At least one task field is required",
);

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
  startDate: z.string().optional(),
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
export type TaskPatch = z.infer<typeof taskPatchSchema>;
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
