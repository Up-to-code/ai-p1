import { z } from "zod";
import {
  calendarEventPatchObjectSchema,
  calendarEventPatchSchema,
  type CalendarEventPatch,
} from "@qentrah/domain-contracts";

export const calendarUpdateToolInputSchema = calendarEventPatchObjectSchema
  .extend({ eventId: z.string().min(1) })
  .strict()
  .refine((input) => Object.keys(input).some((key) => key !== "eventId"), {
    message: "At least one calendar event field is required",
  });

export function parseCalendarUpdatePatch(patch: unknown): CalendarEventPatch {
  return calendarEventPatchSchema.parse(patch);
}
