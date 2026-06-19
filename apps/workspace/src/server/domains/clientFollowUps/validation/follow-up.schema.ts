import { z } from "zod";

export const followUpPayloadSchema = z.object({
  clientId: z.string().trim().min(1),
  type: z.enum(["call", "meeting", "email", "task"]),
  title: z.string().trim().min(1),
  notes: z.string().trim().optional().transform((value) => value || undefined),
  followUpDate: z.number(),
  dueDate: z.string().trim().optional().transform((value) => value || undefined),
  status: z.enum(["completed", "upcoming", "past", "canceled"]),
  opportunityId: z.string().trim().optional().transform((value) => value || undefined),
  projectId: z.string().trim().optional().transform((value) => value || undefined),
  calendarEventId: z.string().trim().optional().transform((value) => value || undefined),
  assigneeUserId: z.string().trim().optional().transform((value) => value || undefined),
  visibility: z.enum(["private", "team", "workspace"]).optional(),
});

export type FollowUpPayload = z.infer<typeof followUpPayloadSchema>;
