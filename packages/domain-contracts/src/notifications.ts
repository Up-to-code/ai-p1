import { z } from "zod";

export const notificationSeveritySchema = z.enum(["info", "warning", "success"]);
export const notificationTypeSchema = z.enum([
  "message",
  "offer_sent",
  "offer_approved",
  "offer_rejected",
  "offer_canceled",
  "offer_completed",
  "invite_sent",
  "invite_accepted",
  "approval_request",
]);

export const notificationSummarySchema = z.object({
  id: z.string().min(1),
  type: notificationTypeSchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  href: z.string().min(1),
  source: z.string().min(1),
  severity: notificationSeveritySchema,
  entityType: z.string().nullable().optional(),
  entityId: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  isRead: z.boolean(),
  createdAt: z.number(),
  pushedAt: z.number().nullable().optional(),
  pushStatus: z.enum(["pending", "sent", "failed", "skipped"]),
});

export const notificationSummaryResponseSchema = z.object({
  unreadCount: z.number().int().nonnegative(),
  latest: z.array(notificationSummarySchema),
});

export const notificationPreferenceSchema = z.object({
  browserPushEnabled: z.boolean(),
});

export const pushSubscriptionInputSchema = z.object({
  endpoint: z.string().url(),
  auth: z.string().min(1),
  p256dh: z.string().min(1),
  userAgent: z.string().optional(),
});

export type NotificationSummary = z.infer<typeof notificationSummarySchema>;
export type NotificationSummaryResponse = z.infer<typeof notificationSummaryResponseSchema>;
export type NotificationPreference = z.infer<typeof notificationPreferenceSchema>;
export type PushSubscriptionInput = z.infer<typeof pushSubscriptionInputSchema>;
