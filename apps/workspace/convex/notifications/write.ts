import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { authUser } from "../auth";
import {
  cancelQueuedJobsForSource,
  defaultPreference,
  getPreference,
  normalizeReminderRules,
  recipientKey,
  scheduleManualNotification,
  tokenLast4,
  userPrincipalKey,
} from "./helpers";
import { pushNotifications } from "./push";
import {
  notificationDeviceValidator,
  notificationPreferenceInputValidator,
  notificationPreferenceValidator,
  notificationScheduleInputValidator,
  notificationScheduleValidator,
} from "./validators";

export const registerDevice = mutation({
  args: {
    pushToken: v.string(),
    installationId: v.string(),
    platform: v.string(),
    appVersion: v.optional(v.string()),
  },
  returns: notificationDeviceValidator,
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    const now = Date.now();
    const key = recipientKey(user._id, args.installationId);
    const existing = await ctx.db
      .query("notificationDevices")
      .withIndex("by_recipient_key", (q) => q.eq("recipientKey", key))
      .unique();

    await pushNotifications.recordToken(ctx, {
      userId: key,
      pushToken: args.pushToken,
    });

    const patch = {
      userId: user._id,
      installationId: args.installationId,
      recipientKey: key,
      platform: args.platform,
      ...(args.appVersion ? { appVersion: args.appVersion } : {}),
      tokenLast4: tokenLast4(args.pushToken),
      status: "active" as const,
      updatedAt: now,
      lastRegisteredAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      const device = await ctx.db.get(existing._id);
      if (!device) throw new Error("Notification device was not found.");
      return device;
    }

    const deviceId = await ctx.db.insert("notificationDevices", {
      ...patch,
      createdAt: now,
    });
    const device = await ctx.db.get(deviceId);
    if (!device) throw new Error("Notification device could not be created.");
    return device;
  },
});

export const removeDevice = mutation({
  args: {
    installationId: v.string(),
  },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    const key = recipientKey(user._id, args.installationId);
    const existing = await ctx.db
      .query("notificationDevices")
      .withIndex("by_recipient_key", (q) => q.eq("recipientKey", key))
      .unique();
    await pushNotifications.removeToken(ctx, { userId: key });
    if (!existing) return { removed: false };

    const now = Date.now();
    await ctx.db.patch(existing._id, {
      status: "revoked",
      updatedAt: now,
      revokedAt: now,
    });
    return { removed: true };
  },
});

export const upsertMyPreferences = mutation({
  args: {
    organizationId: v.string(),
    input: notificationPreferenceInputValidator,
  },
  returns: notificationPreferenceValidator,
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    const now = Date.now();
    const principalKey = userPrincipalKey(user._id);
    const existing = await getPreference(ctx, args.organizationId, principalKey);
    const patch = {
      organizationId: args.organizationId,
      principalType: "user" as const,
      principalKey,
      principalUserId: user._id,
      enabled: args.input.enabled,
      categories: args.input.categories,
      ...(args.input.quietHours ? { quietHours: args.input.quietHours } : {}),
      reminderRules: normalizeReminderRules(args.input.reminderRules),
      updatedByUserId: user._id,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      const preference = await ctx.db.get(existing._id);
      if (!preference) throw new Error("Notification preference was not found.");
      return preference;
    }

    const preferenceId = await ctx.db.insert("notificationPreferences", {
      ...patch,
      createdByUserId: user._id,
      createdAt: now,
    });
    const preference = await ctx.db.get(preferenceId);
    if (!preference) throw new Error("Notification preference could not be created.");
    return preference;
  },
});

export const upsertOrganizationPreferences = mutation({
  args: {
    organizationId: v.string(),
    input: notificationPreferenceInputValidator,
  },
  returns: notificationPreferenceValidator,
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    const now = Date.now();
    const principalKey = "organization";
    const existing = await getPreference(ctx, args.organizationId, principalKey);
    const patch = {
      organizationId: args.organizationId,
      principalType: "organization" as const,
      principalKey,
      enabled: args.input.enabled,
      categories: args.input.categories,
      ...(args.input.quietHours ? { quietHours: args.input.quietHours } : {}),
      reminderRules: normalizeReminderRules(args.input.reminderRules),
      updatedByUserId: user._id,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      const preference = await ctx.db.get(existing._id);
      if (!preference) throw new Error("Notification preference was not found.");
      return preference;
    }

    const preferenceId = await ctx.db.insert("notificationPreferences", {
      ...patch,
      createdByUserId: user._id,
      createdAt: now,
    });
    const preference = await ctx.db.get(preferenceId);
    if (!preference) throw new Error("Notification preference could not be created.");
    return preference;
  },
});

export const createSchedule = mutation({
  args: {
    organizationId: v.string(),
    input: notificationScheduleInputValidator,
  },
  returns: notificationScheduleValidator,
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    const now = Date.now();
    const scheduleId = await ctx.db.insert("notificationSchedules", {
      organizationId: args.organizationId,
      ownerUserId: user._id,
      ...args.input,
      status: "active",
      createdByUserId: user._id,
      updatedByUserId: user._id,
      createdAt: now,
      updatedAt: now,
    });
    const schedule = await ctx.db.get(scheduleId);
    if (!schedule) throw new Error("Notification schedule could not be created.");
    await scheduleManualNotification(ctx, schedule);
    return schedule;
  },
});

export const updateSchedule = mutation({
  args: {
    organizationId: v.string(),
    scheduleId: v.id("notificationSchedules"),
    input: notificationScheduleInputValidator,
  },
  returns: notificationScheduleValidator,
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    const existing = await ctx.db.get(args.scheduleId);
    if (!existing || existing.organizationId !== args.organizationId || existing.ownerUserId !== user._id) {
      throw new Error("Notification schedule was not found.");
    }
    const now = Date.now();
    await ctx.db.patch(args.scheduleId, {
      ...args.input,
      status: "active",
      updatedByUserId: user._id,
      updatedAt: now,
    });
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) throw new Error("Notification schedule was not found.");
    await scheduleManualNotification(ctx, schedule);
    return schedule;
  },
});

export const cancelSchedule = mutation({
  args: {
    organizationId: v.string(),
    scheduleId: v.id("notificationSchedules"),
  },
  returns: v.object({ canceled: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    const existing = await ctx.db.get(args.scheduleId);
    if (!existing || existing.organizationId !== args.organizationId || existing.ownerUserId !== user._id) {
      throw new Error("Notification schedule was not found.");
    }
    const now = Date.now();
    await ctx.db.patch(args.scheduleId, {
      status: "canceled",
      updatedByUserId: user._id,
      updatedAt: now,
      canceledAt: now,
    });
    await cancelQueuedJobsForSource(ctx, args.organizationId, "manualSchedule", args.scheduleId);
    return { canceled: true };
  },
});

export const ensureDefaultPreferences = mutation({
  args: {
    organizationId: v.string(),
  },
  returns: notificationPreferenceValidator,
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    const principalKey = userPrincipalKey(user._id);
    const existing = await getPreference(ctx, args.organizationId, principalKey);
    if (existing) return existing;
    const preferenceId = await ctx.db.insert("notificationPreferences", defaultPreference({
      organizationId: args.organizationId,
      userId: user._id,
      principalType: "user",
    }));
    const preference = await ctx.db.get(preferenceId);
    if (!preference) throw new Error("Notification preference could not be created.");
    return preference;
  },
});
