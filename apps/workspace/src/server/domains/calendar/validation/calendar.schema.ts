import { z } from "zod";

export const calendarEventPayloadSchema = z.object({
  title: z.string().trim().min(1),
  ownerUserId: z.string().trim().optional().transform((value) => value || undefined),
  clientId: z.string().trim().optional().transform((value) => value || undefined),
  projectId: z.string().trim().optional().transform((value) => value || undefined),
  taskId: z.string().trim().optional().transform((value) => value || undefined),
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().trim().regex(/^\d{2}:\d{2}$/),
  type: z.enum(["meeting", "deadline", "reminder", "milestone", "focusBlock"]),
  status: z.enum(["confirmed", "pending", "draft"]),
  durationMinutes: z.coerce.number().int().positive().optional().default(30),
  attendeeUserIds: z.array(z.string().trim()).optional(),
  externalAttendees: z.array(z.string().trim()).optional(),
  location: z.string().trim().optional().transform((value) => value || undefined),
  meetingUrl: z.string().trim().optional().transform((value) => value || undefined),
  notes: z.string().trim().optional().transform((value) => value || undefined),
  tags: z.array(z.string().trim()).optional().transform((values) => {
    const tags = values?.filter(Boolean);
    return tags?.length ? tags : undefined;
  }),
});

export type CalendarEventPayload = z.infer<typeof calendarEventPayloadSchema>;

export function floatingDateTimeToTimestamp(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return Date.UTC(year, month - 1, day, hour, minute, 0, 0);
}
