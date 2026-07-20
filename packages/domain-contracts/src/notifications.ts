import { z } from "zod";

export const notificationCategorySchema = z.enum(["calendar", "task", "manual", "organization"]);
export const recurrenceFrequencySchema = z.enum(["daily", "weekly", "monthly"]);

export type NotificationCategory = z.infer<typeof notificationCategorySchema>;
export type RecurrenceFrequency = z.infer<typeof recurrenceFrequencySchema>;
