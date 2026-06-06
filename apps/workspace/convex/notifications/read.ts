import { v } from "convex/values";
import { query } from "../_generated/server";
import { clerkAuthComponent } from "../auth";
import {
  defaultPreference,
  getPreference,
  organizationPrincipalKey,
  userPrincipalKey,
} from "./helpers";
import {
  notificationDeviceValidator,
  notificationPreferenceSurfaceValidator,
  notificationScheduleValidator,
} from "./validators";

export const getMyStatus = query({
  args: {},
  returns: v.object({
    devices: v.array(notificationDeviceValidator),
    hasActiveDevice: v.boolean(),
  }),
  handler: async (ctx) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    const devices = await ctx.db
      .query("notificationDevices")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(20);
    return {
      devices,
      hasActiveDevice: devices.some((device) => device.status === "active"),
    };
  },
});

export const getMyPreferences = query({
  args: { organizationId: v.string() },
  returns: notificationPreferenceSurfaceValidator,
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    return await getPreference(ctx, args.organizationId, userPrincipalKey(user._id))
      ?? defaultPreference({
        organizationId: args.organizationId,
        userId: user._id,
        principalType: "user",
      });
  },
});

export const getOrganizationPreferences = query({
  args: { organizationId: v.string() },
  returns: notificationPreferenceSurfaceValidator,
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    return await getPreference(ctx, args.organizationId, organizationPrincipalKey())
      ?? defaultPreference({
        organizationId: args.organizationId,
        userId: user._id,
        principalType: "organization",
      });
  },
});

export const listMySchedules = query({
  args: {
    organizationId: v.string(),
  },
  returns: v.array(notificationScheduleValidator),
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    return await ctx.db
      .query("notificationSchedules")
      .withIndex("by_organization_owner", (q) => q.eq("organizationId", args.organizationId).eq("ownerUserId", user._id))
      .order("desc")
      .take(100);
  },
});
