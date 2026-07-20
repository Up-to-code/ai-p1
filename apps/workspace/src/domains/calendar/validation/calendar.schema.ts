import { z } from "zod";
import { requiredText } from "@/validation/common.schema";
import {
  calendarEventTypeSchema,
  calendarEventStatusSchema,
} from "@qentrah/domain-contracts";

export const calendarEventSchema = z.object({
  title: requiredText("Title"),
  ownerUserId: z.string().trim().optional(),
  date: requiredText("Date"),
  time: requiredText("Time"),
  type: calendarEventTypeSchema,
  status: calendarEventStatusSchema,
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
