import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { query } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { listResourceMedia, selectCoverUrl } from "../media/data";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { propertyUnitValidator } from "../properties/validators";
import { clientTypeValidator, clientUnitLinkValidator, clientValidator } from "./validators";

function isoDate(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function isoTime(timestamp: number) {
  return new Date(timestamp).toISOString().slice(11, 16);
}

async function nextClientWork(ctx: QueryCtx, organizationId: string, client: Doc<"clients">) {
  const now = Date.now();
  const tasks = await ctx.db
    .query("clientTasks")
    .withIndex("by_client_status", (q) => q.eq("organizationId", organizationId).eq("clientId", client._id).eq("status", "open"))
    .collect();
  const events = await ctx.db
    .query("calendarEvents")
    .withIndex("by_client", (q) => q.eq("organizationId", organizationId).eq("clientId", client._id))
    .collect();

  const nextTask = tasks
    .filter((task) => !task.deletedAt)
    .sort((a, b) => (a.dueAt ?? Number.MAX_SAFE_INTEGER) - (b.dueAt ?? Number.MAX_SAFE_INTEGER))[0];
  const nextEvent = events
    .filter((event) => !event.deletedAt && event.startAt >= now)
    .sort((a, b) => a.startAt - b.startAt)[0];

  if (nextTask?.dueAt && (!nextEvent || nextTask.dueAt <= nextEvent.startAt)) {
    return {
      action: nextTask.title,
      date: isoDate(nextTask.dueAt),
      time: isoTime(nextTask.dueAt),
      syncState: "eligible" as const,
    };
  }

  if (nextEvent) {
    return {
      action: nextEvent.title,
      date: isoDate(nextEvent.startAt),
      time: isoTime(nextEvent.startAt),
      syncState: nextEvent.status === "confirmed" ? ("synced" as const) : ("eligible" as const),
    };
  }

  return {
    action: client.nextAction,
    date: "This week",
    time: "10:00",
    syncState: client.issue ? ("blocked" as const) : ("draft" as const),
  };
}

async function presentClient(ctx: QueryCtx, client: Doc<"clients">) {
  const next = await nextClientWork(ctx, client.organizationId, client);
  return {
    ...client,
    id: client._id,
    nextAction: next.action,
    nextActionDate: next.date,
    appointmentTime: next.time,
    added: isoDate(client.createdAt),
    lastContact: isoDate(client.updatedAt),
    syncState: next.syncState,
  };
}

function presentClientListItem(client: Doc<"clients">) {
  return {
    ...client,
    id: client._id,
    nextActionDate: "This week",
    appointmentTime: "10:00",
    added: isoDate(client.createdAt),
    lastContact: isoDate(client.updatedAt),
    syncState: client.issue ? ("blocked" as const) : ("draft" as const),
  };
}

async function presentProperty(ctx: QueryCtx, property: Doc<"propertyUnits">) {
  const media = await listResourceMedia(ctx, property.organizationId, "property", property._id);
  return {
    ...property,
    id: property._id,
    coverImageUrl: selectCoverUrl(media),
  };
}

export const list = query({
  args: { organizationId: v.string() },
  returns: v.array(clientValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const clients = await ctx.db
      .query("clients")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const active = clients
      .filter((client) => !client.deletedAt)
      .sort((a, b) => b.updatedAt - a.updatedAt);

    return Promise.all(active.map((client) => presentClient(ctx, client)));
  },
});

export const listPaged = query({
  args: {
    organizationId: v.string(),
    paginationOpts: paginationOptsValidator,
    type: v.optional(clientTypeValidator),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const search = args.search?.trim().toLowerCase();

    if (search || args.type) {
      const clients = await ctx.db
        .query("clients")
        .withIndex("by_organization_updated", (q) => q.eq("organizationId", args.organizationId))
        .order("desc")
        .collect();
      const matches = clients
        .filter((client) => !client.deletedAt)
        .filter((client) => !args.type || client.type === args.type)
        .filter((client) => !search || [client.name, client.contact, client.propertyInterest, client.budget].some((value) => value.toLowerCase().includes(search)))
        .slice(0, 100);

      return {
        page: matches.map(presentClientListItem),
        isDone: true,
        continueCursor: "",
      };
    }

    const page = await ctx.db
      .query("clients")
      .withIndex("by_organization_updated", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...page,
      page: page.page
        .filter((client) => !client.deletedAt)
        .map(presentClientListItem),
    };
  },
});

export const stats = query({
  args: { organizationId: v.string() },
  returns: v.object({
    total: v.number(),
    active: v.number(),
    inactive: v.number(),
    buyers: v.number(),
    tenants: v.number(),
    investors: v.number(),
    brokers: v.number(),
    stages: v.object({
      new: v.number(),
      qualified: v.number(),
      viewing: v.number(),
      negotiation: v.number(),
      closed: v.number(),
    }),
  }),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const clients = await ctx.db
      .query("clients")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .collect();
    const active = clients.filter((client) => !client.deletedAt);

    return {
      total: active.length,
      active: active.filter((client) => client.status === "active").length,
      inactive: active.filter((client) => client.status === "inactive").length,
      buyers: active.filter((client) => client.type === "Buyer").length,
      tenants: active.filter((client) => client.type === "Tenant").length,
      investors: active.filter((client) => client.type === "Investor").length,
      brokers: active.filter((client) => client.type === "Broker").length,
      stages: {
        new: active.filter((client) => client.pipelineStage === "new").length,
        qualified: active.filter((client) => client.pipelineStage === "qualified").length,
        viewing: active.filter((client) => client.pipelineStage === "viewing").length,
        negotiation: active.filter((client) => client.pipelineStage === "negotiation").length,
        closed: active.filter((client) => client.pipelineStage === "closed").length,
      },
    };
  },
});

export const options = query({
  args: { organizationId: v.string(), limit: v.optional(v.number()) },
  returns: v.array(v.object({ id: v.string(), name: v.string() })),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const limit = Math.max(1, Math.min(args.limit ?? 100, 200));
    const clients = await ctx.db
      .query("clients")
      .withIndex("by_organization_updated", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .take(limit);

    return clients
      .filter((client) => !client.deletedAt)
      .map((client) => ({ id: client._id, name: client.name }));
  },
});

export const get = query({
  args: { organizationId: v.string(), clientId: v.id("clients") },
  returns: v.union(clientValidator, v.null()),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const client = await ctx.db.get(args.clientId);
    if (!client || client.organizationId !== args.organizationId || client.deletedAt) {
      return null;
    }

    return presentClient(ctx, client);
  },
});

export const listUnitLinks = query({
  args: { organizationId: v.string(), clientId: v.id("clients") },
  returns: v.array(v.object({
    link: clientUnitLinkValidator,
    unit: v.union(propertyUnitValidator, v.null()),
  })),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const client = await ctx.db.get(args.clientId);
    if (!client || client.organizationId !== args.organizationId || client.deletedAt) return [];

    const links = await ctx.db
      .query("clientUnitLinks")
      .withIndex("by_client", (q) => q.eq("organizationId", args.organizationId).eq("clientId", args.clientId))
      .collect();

    return Promise.all(
      links
        .filter((link) => !link.deletedAt)
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .map(async (link) => {
          const unit = await ctx.db.get(link.propertyId as Id<"propertyUnits">);
          return {
            link: { ...link, id: link._id },
            unit: unit && unit.organizationId === args.organizationId && !unit.deletedAt ? await presentProperty(ctx, unit) : null,
          };
        }),
    );
  },
});
