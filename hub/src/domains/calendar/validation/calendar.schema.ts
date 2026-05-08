import { z } from "zod";
import { requiredText } from "@/validation/common.schema";

export const calendarEventSchema = z.object({
  title: requiredText("Title"),
  owner: requiredText("Owner"),
  date: requiredText("Date"),
  time: requiredText("Time"),
  type: z.enum(["client-visit", "site-viewing", "appointment", "signing", "follow-up", "handover", "audit", "custom"]),
  status: z.enum(["confirmed", "pending", "draft"]),
});

export type CalendarEventFormValues = z.input<typeof calendarEventSchema>;
