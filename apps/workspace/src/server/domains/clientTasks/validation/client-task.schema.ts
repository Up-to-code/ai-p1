import { z } from "zod";

export const clientTaskPayloadSchema = z.object({
  clientId: z.string().trim().min(1),
  title: z.string().trim().min(1),
  status: z.enum(["open", "done", "canceled"]).default("open"),
  visibility: z.enum(["private", "public"]).optional(),
  priority: z.enum(["normal", "high", "urgent"]).default("normal"),
  dueAt: z.coerce.number().int().positive().optional(),
  propertyId: z.string().trim().optional().transform((value) => value || undefined),
  projectId: z.string().trim().optional().transform((value) => value || undefined),
  calendarEventId: z.string().trim().optional().transform((value) => value || undefined),
  notes: z.string().trim().optional().transform((value) => value || undefined),
});

export type ClientTaskPayload = z.infer<typeof clientTaskPayloadSchema>;
