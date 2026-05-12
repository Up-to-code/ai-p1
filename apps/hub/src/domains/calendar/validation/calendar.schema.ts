import { z } from "zod";
import { requiredText } from "@/validation/common.schema";

export const calendarEventSchema = z.object({
  title: requiredText("Title"),
  owner: requiredText("Owner"),
  date: requiredText("Date"),
  time: requiredText("Time"),
  type: z.enum(["visit", "call", "meeting", "client-visit", "site-viewing", "appointment", "signing", "follow-up", "handover", "audit", "custom"]),
  status: z.enum(["confirmed", "pending", "draft"]),
  clientId: z.string().optional(),
  unitId: z.string().optional(),
  propertyId: z.string().optional(),
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  customFields: z.array(z.object({
    label: z.string().trim(),
    value: z.string().trim(),
  })).optional(),
});

export type CalendarEventFormValues = z.input<typeof calendarEventSchema>;
