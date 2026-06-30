import { z } from "zod";

export const clientTaskPayloadSchema = z.object({
  title: z.string().trim().min(1),
  status: z.enum(["todo", "inProgress", "waiting", "done", "canceled", "pending", "progress", "submitted", "failed", "success", "inReview", "expire"]).default("todo"),
  pipelineOrder: z.number().finite().optional(),
  visibility: z.enum(["private", "team", "workspace"]).optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  assigneeUserId: z.string().trim().optional().transform((value) => value || undefined),
  clientId: z.string().trim().optional().transform((value) => value || undefined),
  projectId: z.string().trim().optional().transform((value) => value || undefined),
  dueDate: z.string().trim().optional().transform((value) => value || undefined),
  description: z.string().trim().optional().transform((value) => value || undefined),
  tags: z.array(z.string().trim()).optional(),
});

export type ClientTaskPayload = z.infer<typeof clientTaskPayloadSchema>;
