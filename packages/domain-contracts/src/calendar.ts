import { z } from "zod";

export const calendarEventTypeSchema = z.enum(["meeting", "deadline", "reminder", "milestone", "focusBlock"]);
export const calendarEventStatusSchema = z.enum(["confirmed", "pending", "draft"]);

export const calendarEventInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  ownerUserId: z.string().optional(),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  startAt: z.number().int().positive(),
  endAt: z.number().int().positive(),
  type: calendarEventTypeSchema,
  status: calendarEventStatusSchema,
  attendeeUserIds: z.array(z.string()).optional(),
  externalAttendees: z.array(z.string()).optional(),
  location: z.string().trim().optional(),
  meetingUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().trim().optional(),
  tags: z.array(z.string().trim()).optional(),
});

export const calendarEventRecordSchema = z.object({
  _id: z.string(),
  _creationTime: z.number(),
  id: z.string(),
  organizationId: z.string(),
  title: z.string(),
  ownerUserId: z.string().optional(),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  startAt: z.number(),
  endAt: z.number(),
  type: calendarEventTypeSchema,
  status: calendarEventStatusSchema,
  attendeeUserIds: z.array(z.string()).optional(),
  externalAttendees: z.array(z.string()).optional(),
  location: z.string().optional(),
  meetingUrl: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  customFields: z.array(z.object({ key: z.string(), value: z.unknown() })).optional(),
  spaceId: z.string().optional(),
  createdByUserId: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  deletedAt: z.number().optional(),
});

export type CalendarEventType = z.infer<typeof calendarEventTypeSchema>;
export type CalendarEventStatus = z.infer<typeof calendarEventStatusSchema>;
export type CalendarEventInput = z.infer<typeof calendarEventInputSchema>;
export type CalendarEventRecord = z.infer<typeof calendarEventRecordSchema>;

export type CalendarEventSummary = {
  id: string;
  title: string;
  startAt: number;
  endAt: number;
  type: CalendarEventType;
  status: CalendarEventStatus;
  clientId?: string;
  projectId?: string;
  location?: string;
  createdAt: number;
};
