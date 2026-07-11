import { z } from "zod";
import { requiredText } from "@/validation/common.schema";

export const calendarEventSchema = z.object({
  title: requiredText("Title"),
  ownerUserId: z.string().trim().optional(),
  date: requiredText("Date"),
  time: requiredText("Time"),
  type: z.enum(["meeting", "deadline", "document", "reminder", "milestone", "focusBlock"]),
  status: z.enum(["confirmed", "pending", "draft"]),
  durationMinutes: z.coerce.number().int().positive().optional(),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  documentId: z.string().optional(),
  location: z.string().optional(),
  meetingUrl: z.string().optional(),
  notes: z.string().optional(),
  attendeeUserIds: z.array(z.string().trim()).optional(),
  externalAttendees: z.array(z.string().trim()).optional(),
  tags: z.array(z.string().trim()).optional(),
});

export type CalendarEventFormValues = z.input<typeof calendarEventSchema>;
