import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";
import {
  getPreference,
  nextRecurringTime,
  scheduleManualNotification,
  userPrincipalKey,
} from "./helpers";
import { pushNotifications } from "./push";

function minutesInTimezone(timestamp: number, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(timestamp));
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
  return hour * 60 + minute;
}

function isInsideQuietHours(timestamp: number, quietHours: Doc<"notificationPreferences">["quietHours"]) {
  if (!quietHours?.enabled) return false;
  const current = minutesInTimezone(timestamp, quietHours.timezone);
  const start = Math.max(0, Math.min(1439, Math.trunc(quietHours.startMinute)));
  const end = Math.max(0, Math.min(1439, Math.trunc(quietHours.endMinute)));
  if (start === end) return false;
  if (start < end) return current >= start && current < end;
  return current >= start || current < end;
}

function categoryEnabled(
  preference: Doc<"notificationPreferences"> | null,
  category: "calendar" | "task" | "manual" | "organization",
) {
  if (!preference) return true;
  return preference.enabled && preference.categories[category] === true;
}

export const dispatchJob = internalMutation({
  args: { jobId: v.id("notificationJobs") },
  returns: v.object({ state: v.string() }),
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job || job.state !== "queued") return { state: "ignored" };

    const now = Date.now();
    if (job.scheduledAt > now + 60_000) {
      const scheduledFunctionId = await ctx.scheduler.runAt(
        job.scheduledAt,
        internal.notifications.dispatch.dispatchJob,
        { jobId: args.jobId },
      );
      await ctx.db.patch(args.jobId, { scheduledFunctionId, updatedAt: now });
      return { state: "rescheduled" };
    }

    const userPreference = await getPreference(ctx, job.organizationId, userPrincipalKey(job.recipientUserId));
    const orgPreference = await getPreference(ctx, job.organizationId, "organization");
    const allowed =
      categoryEnabled(userPreference, job.category) &&
      categoryEnabled(orgPreference, job.category) &&
      !isInsideQuietHours(now, userPreference?.quietHours) &&
      !isInsideQuietHours(now, orgPreference?.quietHours);

    if (!allowed) {
      await ctx.db.patch(args.jobId, {
        state: "skipped",
        updatedAt: now,
        skippedAt: now,
      });
      return { state: "skipped" };
    }

    const devices = await ctx.db
      .query("notificationDevices")
      .withIndex("by_user_status", (q) => q.eq("userId", job.recipientUserId).eq("status", "active"))
      .take(20);
    if (devices.length === 0) {
      await ctx.db.patch(args.jobId, {
        state: "skipped",
        updatedAt: now,
        skippedAt: now,
        error: "No active mobile push device.",
      });
      return { state: "skipped" };
    }

    try {
      const notificationIds: string[] = [];
      for (const device of devices) {
        const notificationId = await pushNotifications.sendPushNotification(ctx, {
          userId: device.recipientKey,
          allowUnregisteredTokens: true,
          notification: {
            title: job.title,
            body: job.body,
            sound: "default",
            data: job.data,
          },
        });
        if (notificationId) notificationIds.push(String(notificationId));
      }

      await ctx.db.patch(args.jobId, {
        state: "delivered",
        ...(notificationIds.length > 0 ? { componentNotificationId: notificationIds.join(",") } : {}),
        updatedAt: now,
        deliveredAt: now,
      });

      if (job.sourceType === "manualSchedule") {
        const schedule = await ctx.db.get(job.sourceId as Id<"notificationSchedules">);
        if (schedule && schedule.status === "active") {
          const nextAt = nextRecurringTime(schedule, job.scheduledAt);
          if (nextAt) {
            await ctx.db.patch(schedule._id, { scheduledAt: nextAt, updatedAt: now });
            const nextSchedule = await ctx.db.get(schedule._id);
            if (nextSchedule) await scheduleManualNotification(ctx, nextSchedule);
          }
        }
      }

      return { state: "delivered" };
    } catch (error) {
      await ctx.db.patch(args.jobId, {
        state: "failed",
        error: error instanceof Error ? error.message : "Push delivery failed.",
        updatedAt: now,
        failedAt: now,
      });
      return { state: "failed" };
    }
  },
});

export const recoverDueJobs = internalMutation({
  args: {},
  returns: v.object({ scheduled: v.number() }),
  handler: async (ctx) => {
    const now = Date.now();
    const jobs = await ctx.db
      .query("notificationJobs")
      .withIndex("by_state_scheduled", (q) => q.eq("state", "queued").lte("scheduledAt", now))
      .take(50);
    for (const job of jobs) {
      await ctx.scheduler.runAfter(0, internal.notifications.dispatch.dispatchJob, { jobId: job._id });
    }
    return { scheduled: jobs.length };
  },
});
