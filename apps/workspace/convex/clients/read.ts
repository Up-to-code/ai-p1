import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { query } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { revealClientPii } from "../security/clientPii";
import {
  activeUpdatedWorkspaceRows,
  activeWorkspaceRows,
  boundedWorkspaceReadLimit,
  presentActiveWorkspacePage,
} from "../workspace/readSurface";
import { clientStats } from "../workspace/readStats";
import { clientTypeValidator, clientValidator, resolveClientPipelineStage } from "./validators";

const MAX_LIST_ITEMS = 300;
const MAX_SEARCH_SCAN_ITEMS = 500;
const MAX_STATS_SCAN_ITEMS = 2_000;

function withoutPrivateClientFields(client: Doc<"clients">) {
  const safeClient = { ...client };
  delete safeClient.deletedAt;
  delete safeClient.isDeleted;
  delete safeClient.encryptedEmail;
  delete safeClient.encryptedPhone;
  delete safeClient.piiEncryptedAt;
  return safeClient;
}

function isoDate(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

async function presentClient(client: Doc<"clients">) {
  const safeClient = withoutPrivateClientFields(client);
  const pii = await revealClientPii(client);
  return {
    ...safeClient,
    ...pii,
    id: client._id,
    visibility: client.visibility ?? "private",
    phone: pii.phone ?? client.phone ?? "",
    contact: pii.email ?? client.email ?? client.phone ?? client.company ?? "",
    priority: "normal" as const,
    budget: "",
    assetInterest: client.notes ?? client.source,
    pipelineStage: resolveClientPipelineStage(client),
    pipelineOrder: client.pipelineOrder,
    added: isoDate(client.createdAt),
    lastContact: isoDate(client.updatedAt),
  };
}

async function presentClientListItem(client: Doc<"clients">) {
  const safeClient = withoutPrivateClientFields(client);
  const pii = await revealClientPii(client);
  return {
    ...safeClient,
    ...pii,
    id: client._id,
    visibility: client.visibility ?? "private",
    phone: pii.phone ?? client.phone ?? "",
    contact: pii.email ?? client.email ?? client.phone ?? client.company ?? "",
    priority: "normal" as const,
    budget: "",
    assetInterest: client.notes ?? client.source,
    pipelineStage: resolveClientPipelineStage(client),
    pipelineOrder: client.pipelineOrder,
    added: isoDate(client.createdAt),
    lastContact: isoDate(client.updatedAt),
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
        .filter((client) => !search || [
          client.name,
          client.email,
          client.phone,
          client.company,
          client.contactName,
          client.source,
        ].some((value) => value?.toLowerCase().includes(search)))
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
    new: v.number(),
    active: v.number(),
    nurture: v.number(),
    inactive: v.number(),
    archived: v.number(),
    people: v.number(),
    organizations: v.number(),
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

    return presentClient(client);
  },
});
