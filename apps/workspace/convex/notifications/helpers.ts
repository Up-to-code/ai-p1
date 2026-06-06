import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { internal } from "../_generated/api";

export type NotificationCategory = "calendar" | "task" | "manual" | "organization";
export type NotificationSourceType = "calendarEvent" | "task" | "manualSchedule";
export type NotificationTrigger = "before_start" | "at_start" | "after_start" | "after_complete";

export type ReminderRule = {
  id: string;
  sourceType: NotificationSourceType;
  trigger: NotificationTrigger;
  offsetMinutes: number;
  enabled: boolean;
};

export const defaultNotificationCategories = {
  calendar: true,
  task: true,
  manual: true,
  organization: true,
};

export const defaultReminderRules: ReminderRule[] = [
  {
    id: "calendar-before-30",
    sourceType: "calendarEvent",
    trigger: "before_start",
    offsetMinutes: 30,
    enabled: true,
  },
  {
    id: "calendar-before-5",
    sourceType: "calendarEvent",
    trigger: "before_start",
    offsetMinutes: 5,
    enabled: true,
  },
  {
    id: "calendar-at-start",
    sourceType: "calendarEvent",
    trigger: "at_start",
    offsetMinutes: 0,
    enabled: true,
  },
  {
    id: "task-before-30",
    sourceType: "task",
    trigger: "before_start",
    offsetMinutes: 30,
    enabled: true,
  },
  {
    id: "task-after-complete-disabled",
    sourceType: "task",
    trigger: "after_complete",
    offsetMinutes: 60,
    enabled: false,
  },
];

export function userPrincipalKey(userId: string) {
  return `user:${userId}`;
}

export function organizationPrincipalKey() {
  return "organization";
}

export function recipientKey(userId: string, installationId: string) {
  return `${userId}:${installationId}`;
}

export function tokenLast4(token: string) {
  return token.slice(-4);
}

export function defaultPreference(input: {
  organizationId: string;
  userId: string;
  principalType: "user" | "organization";
}) {
  const now = Date.now();
  const principalKey = input.principalType === "user"
    ? userPrincipalKey(input.userId)
    : organizationPrincipalKey();

  return {
    organizationId: input.organizationId,
    principalType: input.principalType,
    principalKey,
    ...(input.principalType === "user" ? { principalUserId: input.userId } : {}),
    enabled: true,
    categories: defaultNotificationCategories,
    reminderRules: defaultReminderRules,
    createdByUserId: input.userId,
    updatedByUserId: input.userId,
    createdAt: now,
    updatedAt: now,
  };
}

export function normalizeReminderRules(rules: ReminderRule[]) {
  return rules
    .filter((rule) => rule.id.trim() && Number.isFinite(rule.offsetMinutes))
    .map((rule) => ({
      ...rule,
      id: rule.id.trim(),
      offsetMinutes: Math.trunc(rule.offsetMinutes),
      enabled: rule.enabled === true,
    }));
}

export async function getPreference(
  ctx: QueryCtx | MutationCtx,
  organizationId: string,
  principalKey: string,
) {
  return ctx.db
    .query("notificationPreferences")
    .withIndex("by_organization_principal", (q) => q.eq("organizationId", organizationId).eq("principalKey", principalKey))
    .unique();
}

export async function getEffectivePreference(
  ctx: QueryCtx | MutationCtx,
  organizationId: string,
  userId: string,
) {
  return await getPreference(ctx, organizationId, userPrincipalKey(userId))
    ?? defaultPreference({ organizationId, userId, principalType: "user" });
}

export function scheduledAtForRule(anchorAt: number, completedAt: number | undefined, rule: ReminderRule) {
  if (rule.trigger === "at_start") return anchorAt;
  if (rule.trigger === "before_start") return anchorAt - rule.offsetMinutes * 60_000;
  if (rule.trigger === "after_start") return anchorAt + rule.offsetMinutes * 60_000;
  if (rule.trigger === "after_complete" && completedAt) return completedAt + rule.offsetMinutes * 60_000;
  return null;
}

function reminderBody(sourceTitle: string, rule: ReminderRule) {
  if (rule.trigger === "at_start") return `${sourceTitle} is starting now.`;
  if (rule.trigger === "before_start") {
    return `${sourceTitle} starts in ${Math.max(0, rule.offsetMinutes)} minutes.`;
  }
  if (rule.trigger === "after_complete") {
    return `Follow up on ${sourceTitle}.`;
  }
  return `${sourceTitle} reminder.`;
}

function scheduleTime(now: number, anchorAt: number, ruleScheduledAt: number, rule: ReminderRule) {
  if (rule.trigger === "at_start" && anchorAt - now <= 10 * 60_000 && anchorAt >= now) {
    return now;
  }
  return ruleScheduledAt;
}

export async function cancelQueuedJobsForSource(
  ctx: MutationCtx,
  organizationId: string,
  sourceType: NotificationSourceType,
  sourceId: string,
) {
  const queued = await ctx.db
    .query("notificationJobs")
    .withIndex("by_source_state", (q) =>
      q.eq("organizationId", organizationId)
        .eq("sourceType", sourceType)
        .eq("sourceId", sourceId)
        .eq("state", "queued"))
    .take(100);
  const now = Date.now();
  for (const job of queued) {
    await ctx.db.patch(job._id, {
      state: "canceled",
      updatedAt: now,
      canceledAt: now,
    });
  }
}

export async function createNotificationJob(
  ctx: MutationCtx,
  input: {
    organizationId: string;
    recipientUserId: string;
    sourceType: NotificationSourceType;
    sourceId: string;
    trigger: NotificationTrigger | "manual";
    category: NotificationCategory;
    scheduledAt: number;
    title: string;
    body: string;
    url?: string;
    createdByUserId: string;
  },
) {
  const now = Date.now();
  if (input.scheduledAt < now - 60_000) return null;
  const data = {
    ...(input.url ? { url: input.url } : {}),
    organizationId: input.organizationId,
    sourceType: input.sourceType,
    sourceId: input.sourceId,
  };
  const jobId = await ctx.db.insert("notificationJobs", {
    organizationId: input.organizationId,
    recipientUserId: input.recipientUserId,
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    trigger: input.trigger,
    category: input.category,
    scheduledAt: input.scheduledAt,
    state: "queued",
    title: input.title,
    body: input.body,
    data,
    createdByUserId: input.createdByUserId,
    createdAt: now,
    updatedAt: now,
  });
  const scheduledFunctionId = await ctx.scheduler.runAt(
    input.scheduledAt,
    internal.notifications.dispatch.dispatchJob,
    { jobId },
  );
  await ctx.db.patch(jobId, { scheduledFunctionId });
  return jobId;
}

export async function scheduleCalendarEventReminders(
  ctx: MutationCtx,
  event: Doc<"calendarEvents">,
) {
  await cancelQueuedJobsForSource(ctx, event.organizationId, "calendarEvent", event._id);
  if (event.deletedAt) return;

  const preference = await getEffectivePreference(ctx, event.organizationId, event.createdByUserId);
  const now = Date.now();
  const rules = normalizeReminderRules(preference.reminderRules as ReminderRule[])
    .filter((rule) => rule.enabled && rule.sourceType === "calendarEvent");
  for (const rule of rules) {
    const calculated = scheduledAtForRule(event.startAt, undefined, rule);
    if (calculated === null) continue;
    const scheduledAt = scheduleTime(now, event.startAt, calculated, rule);
    if (scheduledAt < now - 60_000) continue;
    await createNotificationJob(ctx, {
      organizationId: event.organizationId,
      recipientUserId: event.createdByUserId,
      sourceType: "calendarEvent",
      sourceId: event._id,
      trigger: rule.trigger,
      category: "calendar",
      scheduledAt,
      title: event.title,
      body: reminderBody(event.title, rule),
      url: `/calendar?eventId=${event._id}`,
      createdByUserId: event.createdByUserId,
    });
  }
}

export async function scheduleTaskReminders(
  ctx: MutationCtx,
  task: Doc<"clientTasks">,
) {
  await cancelQueuedJobsForSource(ctx, task.organizationId, "task", task._id);
  if (task.deletedAt || task.status === "canceled") return;

  const preference = await getEffectivePreference(ctx, task.organizationId, task.createdByUserId);
  const rules = normalizeReminderRules(preference.reminderRules as ReminderRule[])
    .filter((rule) => rule.enabled && rule.sourceType === "task");
  for (const rule of rules) {
    const anchorAt = rule.trigger === "after_complete" ? task.completedAt : task.dueAt;
    if (!anchorAt) continue;
    const scheduledAt = scheduledAtForRule(anchorAt, task.completedAt, rule);
    if (scheduledAt === null) continue;
    await createNotificationJob(ctx, {
      organizationId: task.organizationId,
      recipientUserId: task.createdByUserId,
      sourceType: "task",
      sourceId: task._id,
      trigger: rule.trigger,
      category: "task",
      scheduledAt,
      title: task.title,
      body: reminderBody(task.title, rule),
      url: `/clients?taskId=${task._id}`,
      createdByUserId: task.createdByUserId,
    });
  }
}

export function nextRecurringTime(schedule: Doc<"notificationSchedules">, fromAt: number) {
  const recurrence = schedule.recurrence;
  if (!recurrence) return null;
  const interval = Math.max(1, Math.trunc(recurrence.interval));
  const date = new Date(fromAt);
  if (recurrence.frequency === "daily") date.setUTCDate(date.getUTCDate() + interval);
  if (recurrence.frequency === "weekly") date.setUTCDate(date.getUTCDate() + interval * 7);
  if (recurrence.frequency === "monthly") date.setUTCMonth(date.getUTCMonth() + interval);
  const next = date.getTime();
  if (recurrence.untilAt && next > recurrence.untilAt) return null;
  return next;
}

export async function scheduleManualNotification(
  ctx: MutationCtx,
  schedule: Doc<"notificationSchedules">,
) {
  await cancelQueuedJobsForSource(ctx, schedule.organizationId, "manualSchedule", schedule._id);
  if (schedule.status !== "active") return;
  await createNotificationJob(ctx, {
    organizationId: schedule.organizationId,
    recipientUserId: schedule.ownerUserId,
    sourceType: "manualSchedule",
    sourceId: schedule._id,
    trigger: "manual",
    category: schedule.category,
    scheduledAt: schedule.scheduledAt,
    title: schedule.title,
    body: schedule.body,
    url: "/",
    createdByUserId: schedule.createdByUserId,
  });
}
