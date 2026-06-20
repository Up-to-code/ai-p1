import { v } from "convex/values";
import { query } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { isoDate, isoTime, presentWorkspaceRecord } from "../shared/present";
import { activeChronologicalWorkspaceRows, boundedWorkspaceReadLimit } from "../workspace/readSurface";
import { calendarStats } from "../workspace/readStats";
import { calendarEventValidator } from "./validators";

const MAX_LIST_EVENTS = 500;
const MAX_RANGE_EVENTS = 1_000;

async function presentEvent(event: Doc<"calendarEvents">) {
  return {
    ...presentWorkspaceRecord(event),
    date: isoDate(event.startAt),
    time: isoTime(event.startAt),
  };
}

export const list = query({
  args: {
    organizationId: v.string(),
  },
  returns: v.array(calendarEventValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "calendar", "read");
    const events = await ctx.db
      .query("calendarEvents")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .take(MAX_LIST_EVENTS);

    return Promise.all(
      activeChronologicalWorkspaceRows(events).map(presentEvent),
    );
  },
});

export const listRange = query({
  args: {
    organizationId: v.string(),
    startAt: v.number(),
    endAt: v.number(),
  },
  returns: v.array(calendarEventValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "calendar", "read");
    const events = await ctx.db
      .query("calendarEvents")
      .withIndex("by_start", (q) => q.eq("organizationId", args.organizationId).gte("startAt", args.startAt).lte("startAt", args.endAt))
      .take(MAX_RANGE_EVENTS);

    return Promise.all(
      activeChronologicalWorkspaceRows(events).map(presentEvent),
    );
  },
});

export const listUpcoming = query({
  args: {
    organizationId: v.string(),
    startAt: v.number(),
    limit: v.optional(v.number()),
  },
  returns: v.array(calendarEventValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "calendar", "read");
    const limit = boundedWorkspaceReadLimit(args.limit, 50, 100);
    const events = await ctx.db
      .query("calendarEvents")
      .withIndex("by_start", (q) => q.eq("organizationId", args.organizationId).gte("startAt", args.startAt))
      .take(limit);

    return Promise.all(
      activeChronologicalWorkspaceRows(events).map(presentEvent),
    );
  },
});

export const listByProject = query({
  args: {
    organizationId: v.string(),
    projectId: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(calendarEventValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "calendar", "read");
    const limit = boundedWorkspaceReadLimit(args.limit, 100, 300);
    const events = await ctx.db
      .query("calendarEvents")
      .withIndex("by_organization_project", (q) => q.eq("organizationId", args.organizationId).eq("projectId", args.projectId))
      .take(limit);

    return Promise.all(activeChronologicalWorkspaceRows(events).map(presentEvent));
  },
});

export const statsInRange = query({
  args: {
    organizationId: v.string(),
    startAt: v.number(),
    endAt: v.number(),
  },
  returns: v.object({
    total: v.number(),
    confirmed: v.number(),
    pending: v.number(),
    draft: v.number(),
    owners: v.number(),
  }),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "calendar", "read");
    const events = await ctx.db
      .query("calendarEvents")
      .withIndex("by_start", (q) => q.eq("organizationId", args.organizationId).gte("startAt", args.startAt).lte("startAt", args.endAt))
      .take(MAX_RANGE_EVENTS);
    return calendarStats(events);
  },
});
