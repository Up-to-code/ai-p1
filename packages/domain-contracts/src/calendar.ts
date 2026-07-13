import { z } from "zod";

export const calendarEventTypeSchema = z.enum([
  "meeting",
  "deadline",
  "document",
  "reminder",
  "milestone",
  "focusBlock",
]);
export const calendarEventStatusSchema = z.enum([
  "confirmed",
  "pending",
  "draft",
]);

export const calendarEventInputObjectSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  ownerUserId: z.string().optional(),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  documentId: z.string().optional(),
  startAt: z.number().finite(),
  endAt: z.number().finite(),
  type: calendarEventTypeSchema,
  status: calendarEventStatusSchema,
  attendeeUserIds: z.array(z.string()).optional(),
  externalAttendees: z.array(z.string()).optional(),
  location: z.string().optional(),
  meetingUrl: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
}).strict();

export const calendarEventInputSchema = calendarEventInputObjectSchema.refine(
  (event) => event.endAt >= event.startAt,
  { message: "Event end must not be before its start", path: ["endAt"] },
);

export const calendarEventPatchObjectSchema = calendarEventInputObjectSchema.partial();
export const calendarEventPatchSchema = calendarEventPatchObjectSchema.refine(
  (patch) => Object.keys(patch).length > 0,
  "At least one calendar event field is required",
);

export type CalendarEventInput = z.infer<typeof calendarEventInputSchema>;
export type CalendarEventPatch = z.infer<typeof calendarEventPatchSchema>;
export type CalendarEventType = z.infer<typeof calendarEventTypeSchema>;
export type CalendarEventStatus = z.infer<typeof calendarEventStatusSchema>;
