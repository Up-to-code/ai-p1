import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertOrganizationPermission } from "../organizations/profile/access";
import { dashboardOverview } from "../workspace/dashboardOverview";

const MAX_DASHBOARD_DISPLAY_PROJECTS = 3;
const MAX_DASHBOARD_COUNT_SCAN = 2_000;
const MAX_DASHBOARD_RANGE_ITEMS = 1_000;

export const overview = query({
  args: {
    organizationId: v.string(),
    startAt: v.number(),
    endAt: v.number(),
  },
  returns: v.object({
    counts: v.object({
      dueToday: v.number(),
      availableUnits: v.number(),
      reviewUnits: v.number(),
      readyProjects: v.number(),
      blockedProjects: v.number(),
      totalProjects: v.number(),
    }),
    projects: v.array(v.object({
      id: v.string(),
      name: v.string(),
      reference: v.string(),
      city: v.string(),
      status: v.string(),
      units: v.number(),
      priceRange: v.string(),
    })),
    weekEvents: v.array(v.object({
      id: v.string(),
      title: v.string(),
      date: v.string(),
      time: v.string(),
      owner: v.string(),
      clientName: v.optional(v.string()),
      priority: v.union(v.literal("normal"), v.literal("high"), v.literal("urgent")),
      type: v.string(),
    })),
  }),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    const [
      displayProjects,
      allProjects,
      approvedProjects,
      pendingProjects,
      availableUnits,
      pendingUnits,
      draftUnits,
      tasks,
      events,
    ] = await Promise.all([
      ctx.db
        .query("projects")
        .withIndex("by_organization_updated", (q) => q.eq("organizationId", args.organizationId))
        .order("desc")
        .take(MAX_DASHBOARD_DISPLAY_PROJECTS),
      ctx.db
        .query("projects")
        .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
        .take(MAX_DASHBOARD_COUNT_SCAN),
      ctx.db
        .query("projects")
        .withIndex("by_organization_status", (q) => q.eq("organizationId", args.organizationId).eq("status", "approved"))
        .take(MAX_DASHBOARD_COUNT_SCAN),
      ctx.db
        .query("projects")
        .withIndex("by_organization_status", (q) => q.eq("organizationId", args.organizationId).eq("status", "pending"))
        .take(MAX_DASHBOARD_COUNT_SCAN),
      ctx.db
        .query("propertyUnits")
        .withIndex("by_organization_status", (q) => q.eq("organizationId", args.organizationId).eq("status", "available"))
        .take(MAX_DASHBOARD_COUNT_SCAN),
      ctx.db
        .query("propertyUnits")
        .withIndex("by_organization_status", (q) => q.eq("organizationId", args.organizationId).eq("status", "pending"))
        .take(MAX_DASHBOARD_COUNT_SCAN),
      ctx.db
        .query("propertyUnits")
        .withIndex("by_organization_status", (q) => q.eq("organizationId", args.organizationId).eq("status", "draft"))
        .take(MAX_DASHBOARD_COUNT_SCAN),
      ctx.db
        .query("clientTasks")
        .withIndex("by_due", (q) => q.eq("organizationId", args.organizationId).gte("dueAt", args.startAt).lte("dueAt", args.endAt))
        .take(MAX_DASHBOARD_RANGE_ITEMS),
      ctx.db
        .query("calendarEvents")
        .withIndex("by_start", (q) => q.eq("organizationId", args.organizationId).gte("startAt", args.startAt).lte("startAt", args.endAt))
        .take(MAX_DASHBOARD_RANGE_ITEMS),
    ]);

    return dashboardOverview(
      {
        displayProjects,
        allProjects,
        approvedProjects,
        pendingProjects,
        availableUnits,
        pendingUnits,
        draftUnits,
        tasks,
        events,
      },
      (clientId) => ctx.db.get(clientId),
    );
  },
});
