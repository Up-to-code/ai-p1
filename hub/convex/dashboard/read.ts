import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertOrganizationPermission } from "../organizations/profile/access";

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
    const [projects, units, tasks, events] = await Promise.all([
      ctx.db
        .query("projects")
        .withIndex("by_organization_updated", (q) => q.eq("organizationId", args.organizationId))
        .order("desc")
        .collect(),
      ctx.db
        .query("propertyUnits")
        .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
        .collect(),
      ctx.db
        .query("clientTasks")
        .withIndex("by_due", (q) => q.eq("organizationId", args.organizationId).gte("dueAt", args.startAt).lte("dueAt", args.endAt))
        .collect(),
      ctx.db
        .query("calendarEvents")
        .withIndex("by_start", (q) => q.eq("organizationId", args.organizationId).gte("startAt", args.startAt).lte("startAt", args.endAt))
        .collect(),
    ]);

    const activeProjects = projects.filter((project) => !project.deletedAt);
    const activeUnits = units.filter((unit) => !unit.deletedAt);
    const activeTasks = tasks.filter((task) => !task.deletedAt && task.status === "open");
    const activeEvents = events.filter((event) => !event.deletedAt);
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
        availableUnits: activeUnits.filter((unit) => unit.status === "available").length,
        reviewUnits: activeUnits.filter((unit) => unit.status === "pending" || unit.status === "draft").length,
        readyProjects: activeProjects.filter((project) => project.status === "approved" && project.syncState === "synced").length,
        blockedProjects: activeProjects.filter((project) => project.status === "pending" || project.syncState === "blocked").length,
        totalProjects: activeProjects.length,
      },
      projects: activeProjects.slice(0, 3).map((project) => ({
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
