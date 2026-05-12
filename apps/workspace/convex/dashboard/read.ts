import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertOrganizationPermission } from "../organizations/profile/access";

const MAX_DASHBOARD_DISPLAY_PROJECTS = 3;
const MAX_DASHBOARD_COUNT_SCAN = 2_000;
const MAX_DASHBOARD_RANGE_ITEMS = 1_000;

function isoDate(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function isoTime(timestamp: number) {
  return new Date(timestamp).toISOString().slice(11, 16);
}

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

    const activeDisplayProjects = displayProjects.filter((project) => !project.deletedAt);
    const activeProjects = allProjects.filter((project) => !project.deletedAt);
    const activeApprovedProjects = approvedProjects.filter((project) => !project.deletedAt);
    const activePendingProjects = pendingProjects.filter((project) => !project.deletedAt);
    const activeAvailableUnits = availableUnits.filter((unit) => !unit.deletedAt);
    const activePendingUnits = pendingUnits.filter((unit) => !unit.deletedAt);
    const activeDraftUnits = draftUnits.filter((unit) => !unit.deletedAt);
    const activeTasks = tasks.filter((task) => !task.deletedAt && task.status === "open");
    const activeEvents = events.filter((event) => !event.deletedAt);
    const blockedProjectIds = new Set([
      ...activePendingProjects.map((project) => project._id),
      ...activeProjects.filter((project) => project.syncState === "blocked").map((project) => project._id),
    ]);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const weekEvents = await Promise.all(
      activeEvents
        .sort((a, b) => a.startAt - b.startAt)
        .slice(0, 20)
        .map(async (event) => {
          const client = event.clientId ? await ctx.db.get(event.clientId) : null;
          const linkedTask = activeTasks.find((task) => task.calendarEventId === event._id);
          return {
            id: event._id,
            title: event.title,
            date: isoDate(event.startAt),
            time: isoTime(event.startAt),
            owner: event.owner,
            clientName: client && !client.deletedAt ? client.name : undefined,
            priority: linkedTask?.priority ?? ("normal" as const),
            type: event.type,
          };
        }),
    );

    return {
      counts: {
        dueToday: activeTasks.filter((task) => task.dueAt && task.dueAt <= today.getTime()).length,
        availableUnits: activeAvailableUnits.length,
        reviewUnits: activePendingUnits.length + activeDraftUnits.length,
        readyProjects: activeApprovedProjects.filter((project) => project.syncState === "synced").length,
        blockedProjects: blockedProjectIds.size,
        totalProjects: activeProjects.length,
      },
      projects: activeDisplayProjects.map((project) => ({
        id: project._id,
        name: project.name,
        reference: project.reference,
        city: project.city,
        status: project.status,
        units: project.units,
        priceRange: project.priceRange,
      })),
      weekEvents,
    };
  },
});
