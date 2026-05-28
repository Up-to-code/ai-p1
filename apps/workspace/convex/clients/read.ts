import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { query } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { listResourceMedia, selectCoverUrl } from "../media/data";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { revealClientPii } from "../security/clientPii";
import {
  activeChronologicalWorkspaceRows,
  activeDueWorkspaceRows,
  activeUpdatedWorkspaceRows,
  activeWorkspaceRows,
  boundedWorkspaceReadLimit,
  presentActiveWorkspacePage,
} from "../workspace/readSurface";
import { clientStats } from "../workspace/readStats";
import { propertyUnitValidator } from "../properties/validators";
import { clientTypeValidator, clientUnitLinkValidator, clientValidator } from "./validators";

const MAX_LIST_ITEMS = 300;
const MAX_CLIENT_WORK_ITEMS = 50;
const MAX_SEARCH_SCAN_ITEMS = 500;
const MAX_STATS_SCAN_ITEMS = 2_000;
const MAX_LINK_ITEMS = 100;

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
    .take(MAX_CLIENT_WORK_ITEMS);
  const events = await ctx.db
    .query("calendarEvents")
    .withIndex("by_client", (q) => q.eq("organizationId", organizationId).eq("clientId", client._id))
    .take(MAX_CLIENT_WORK_ITEMS);

  const nextTask = activeDueWorkspaceRows(tasks)[0];
  const nextEvent = activeChronologicalWorkspaceRows(events.filter((event) => event.startAt >= now))[0];

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
  const { deletedAt: _deletedAt, isDeleted: _isDeleted, encryptedContact: _encryptedContact, encryptedPhone: _encryptedPhone, encryptedNationality: _encryptedNationality, encryptedBudget: _encryptedBudget, piiEncryptedAt: _piiEncryptedAt, ...safeClient } = client;
  return {
    ...safeClient,
    ...await revealClientPii(client),
    id: client._id,
    visibility: client.visibility ?? "private",
    nextAction: next.action,
    nextActionDate: next.date,
    appointmentTime: next.time,
    added: isoDate(client.createdAt),
    lastContact: isoDate(client.updatedAt),
    syncState: next.syncState,
  };
}

async function presentClientListItem(client: Doc<"clients">) {
  const { deletedAt: _deletedAt, isDeleted: _isDeleted, encryptedContact: _encryptedContact, encryptedPhone: _encryptedPhone, encryptedNationality: _encryptedNationality, encryptedBudget: _encryptedBudget, piiEncryptedAt: _piiEncryptedAt, ...safeClient } = client;
  return {
    ...safeClient,
    ...await revealClientPii(client),
    id: client._id,
    visibility: client.visibility ?? "private",
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
    visibility: property.visibility ?? "private",
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
      .take(MAX_LIST_ITEMS);

    // Source guard: list reads must stay list-item only, never per-client detail fan-out.
    // Keep the transformation equivalent to: return active.map(presentClientListItem)
    return Promise.all(activeUpdatedWorkspaceRows(clients).map(presentClientListItem));
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

    if (search) {
      const clients = await ctx.db
        .query("clients")
        .withIndex("by_organization_updated", (q) => q.eq("organizationId", args.organizationId))
        .order("desc")
        .take(MAX_SEARCH_SCAN_ITEMS);
      const presented = await Promise.all(activeWorkspaceRows(clients)
        .filter((client) => !args.type || client.type === args.type)
        .map(presentClientListItem));
      const matches = presented
        .filter((client) => !search || [client.name, client.contact, client.propertyInterest, client.budget].some((value) => value.toLowerCase().includes(search)))
        .slice(0, 100);

      return {
        page: matches,
        isDone: true,
        continueCursor: "",
      };
    }

    const page = await ctx.db
      .query("clients")
      .withIndex(
        args.type ? "by_organization_type" : "by_organization_updated",
        (q) => args.type
          ? q.eq("organizationId", args.organizationId).eq("type", args.type)
          : q.eq("organizationId", args.organizationId),
      )
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...page,
      page: await presentActiveWorkspacePage(page.page, presentClientListItem),
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
      .take(MAX_STATS_SCAN_ITEMS);
    return clientStats(clients);
  },
});

export const options = query({
  args: { organizationId: v.string(), limit: v.optional(v.number()) },
  returns: v.array(v.object({ id: v.string(), name: v.string() })),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const limit = boundedWorkspaceReadLimit(args.limit, 100, 200);
    const clients = await ctx.db
      .query("clients")
      .withIndex("by_organization_updated", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .take(limit);

    return Promise.all(activeWorkspaceRows(clients).map(async (client) => ({ id: client._id, name: client.name })));
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
      .take(MAX_LINK_ITEMS);

    return Promise.all(
      activeUpdatedWorkspaceRows(links)
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

export const listUnitLinksForProperty = query({
  args: { organizationId: v.string(), propertyId: v.id("propertyUnits") },
  returns: v.array(v.object({
    link: clientUnitLinkValidator,
    client: v.union(clientValidator, v.null()),
  })),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const property = await ctx.db.get(args.propertyId);
    if (!property || property.organizationId !== args.organizationId || property.deletedAt) return [];

    const links = await ctx.db
      .query("clientUnitLinks")
      .withIndex("by_property", (q) => q.eq("organizationId", args.organizationId).eq("propertyId", args.propertyId))
      .take(MAX_LINK_ITEMS);

    return Promise.all(
      activeUpdatedWorkspaceRows(links)
        .map(async (link) => {
          const client = await ctx.db.get(link.clientId as Id<"clients">);
          return {
            link: { ...link, id: link._id },
            client: client && client.organizationId === args.organizationId && !client.deletedAt ? await presentClient(ctx, client) : null,
          };
        }),
    );
  },
});
