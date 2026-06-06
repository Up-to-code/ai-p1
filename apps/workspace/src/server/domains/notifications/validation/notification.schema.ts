import { z } from "zod";

const categorySchema = z.object({
  calendar: z.boolean(),
  task: z.boolean(),
  manual: z.boolean(),
  organization: z.boolean(),
});

const quietHoursSchema = z.object({
  enabled: z.boolean(),
  startMinute: z.number().int().min(0).max(1439),
  endMinute: z.number().int().min(0).max(1439),
  timezone: z.string().trim().min(1).max(80),
}).optional();

const reminderRuleSchema = z.object({
  id: z.string().trim().min(1).max(80),
  sourceType: z.enum(["calendarEvent", "task", "manualSchedule"]),
  trigger: z.enum(["before_start", "at_start", "after_start", "after_complete"]),
  offsetMinutes: z.number().int().min(0).max(10080),
  enabled: z.boolean(),
});

export const notificationPreferenceSchema = z.object({
  enabled: z.boolean(),
  categories: categorySchema,
  quietHours: quietHoursSchema,
  reminderRules: z.array(reminderRuleSchema).max(20),
});

export const pushDeviceSchema = z.object({
  pushToken: z.string().trim().min(1).max(512),
  installationId: z.string().trim().min(1).max(160),
  platform: z.string().trim().min(1).max(40),
  appVersion: z.string().trim().max(40).optional(),
});

export const notificationScheduleSchema = z.object({
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(400),
  category: z.enum(["calendar", "task", "manual", "organization"]).default("manual"),
  scheduledAt: z.number().int().positive(),
  timezone: z.string().trim().max(80).optional(),
  recurrence: z.object({
    frequency: z.enum(["daily", "weekly", "monthly"]),
    interval: z.number().int().min(1).max(30),
    untilAt: z.number().int().positive().optional(),
  }).optional(),
});

export type NotificationPreferenceInput = z.infer<typeof notificationPreferenceSchema>;
export type PushDeviceInput = z.infer<typeof pushDeviceSchema>;
export type NotificationScheduleInput = z.infer<typeof notificationScheduleSchema>;
