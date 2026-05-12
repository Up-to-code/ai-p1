import { z } from "zod";

export const calendarEventPayloadSchema = z.object({
  title: z.string().trim().min(1),
  owner: z.string().trim().min(1),
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().trim().regex(/^\d{2}:\d{2}$/),
  type: z.enum(["visit", "call", "meeting", "client-visit", "site-viewing", "appointment", "signing", "follow-up", "handover", "audit", "custom"]),
  status: z.enum(["confirmed", "pending", "draft"]),
  clientId: z.string().trim().optional().transform((value) => value || undefined),
  unitId: z.string().trim().optional().transform((value) => value || undefined),
  propertyId: z.string().trim().optional().transform((value) => value || undefined),
  projectId: z.string().trim().optional().transform((value) => value || undefined),
  taskId: z.string().trim().optional().transform((value) => value || undefined),
  location: z.string().trim().optional().transform((value) => value || undefined),
  notes: z.string().trim().optional().transform((value) => value || undefined),
  customFields: z.array(z.object({
    label: z.string().trim(),
    value: z.string().trim(),
  })).optional().transform((fields) =>
    fields
      ?.map((field) => ({ label: field.label.trim(), value: field.value.trim() }))
      .filter((field) => field.label || field.value),
  ),
});

export type CalendarEventPayload = z.infer<typeof calendarEventPayloadSchema>;

export function floatingDateTimeToTimestamp(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return Date.UTC(year, month - 1, day, hour, minute, 0, 0);
}
