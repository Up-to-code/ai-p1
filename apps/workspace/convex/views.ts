import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { savedViewFilterValidator, savedViewColumnValidator, viewTypeValidator, workOsRecordResourceValidator } from "./schema/validators";

const legacyViewConfigValidator = v.object({
  type: viewTypeValidator,
  label: v.string(),
  filters: v.optional(v.array(savedViewFilterValidator)),
  sortBy: v.string(),
  sortDirection: v.union(v.literal("asc"), v.literal("desc")),
  groupBy: v.optional(v.string()),
  columns: v.optional(v.array(savedViewColumnValidator)),
  density: v.union(v.literal("compact"), v.literal("normal")),
});

export const createView = mutation({
  args: {
    organizationId: v.string(),
    domain: workOsRecordResourceValidator,
    spaceId: v.optional(v.id("spaces")),
    projectId: v.optional(v.id("projects")),
    viewConfig: legacyViewConfigValidator,
    isDefault: v.optional(v.boolean()),
  },
  returns: v.id("savedViews"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const now = Date.now();
    const scope = args.projectId
      ? { scopeType: "project" as const, scopeId: args.projectId }
      : args.spaceId
        ? { scopeType: "space" as const, scopeId: args.spaceId }
        : { scopeType: "workspace" as const, scopeId: undefined };

    return await ctx.db.insert("savedViews", {
      organizationId: args.organizationId,
      resourceType: args.domain,
      viewType: args.viewConfig.type,
      name: args.viewConfig.label,
      ownerUserId: identity.subject,
      scopeType: scope.scopeType,
      scopeId: scope.scopeId,
      visibility: "private",
      config: {
        filters: args.viewConfig.filters,
        sortBy: args.viewConfig.sortBy,
        sortDirection: args.viewConfig.sortDirection,
        groupBy: args.viewConfig.groupBy,
        columns: args.viewConfig.columns,
        density: args.viewConfig.density,
      },
      isDefault: args.isDefault,
      isSystemDefault: false,
      isRemovable: true,
      recordState: "active",
      createdByUserId: identity.subject,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateView = mutation({
  args: {
    viewId: v.id("savedViews"),
    viewConfig: legacyViewConfigValidator,
  },
  returns: v.id("savedViews"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const view = await ctx.db.get(args.viewId);
    if (!view) throw new Error("View not found");
    if (view.ownerUserId !== identity.subject && view.createdByUserId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.viewId, {
      viewType: args.viewConfig.type,
      name: args.viewConfig.label,
      config: {
        filters: args.viewConfig.filters,
        sortBy: args.viewConfig.sortBy,
        sortDirection: args.viewConfig.sortDirection,
        groupBy: args.viewConfig.groupBy,
        columns: args.viewConfig.columns,
        density: args.viewConfig.density,
      },
      updatedAt: Date.now(),
    });
    return args.viewId;
  },
});

export const deleteView = mutation({
  args: { viewId: v.id("savedViews") },
  returns: v.id("savedViews"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const view = await ctx.db.get(args.viewId);
    if (!view) throw new Error("View not found");
    if (view.ownerUserId !== identity.subject && view.createdByUserId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const now = Date.now();
    await ctx.db.patch(args.viewId, { recordState: "deleted", deletedAt: now, updatedAt: now });
    return args.viewId;
  },
});

export const getViews = query({
  args: {
    organizationId: v.string(),
    domain: v.optional(workOsRecordResourceValidator),
    spaceId: v.optional(v.id("spaces")),
    projectId: v.optional(v.id("projects")),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const domain = args.domain;
    if (!domain) return [];
    const views = await ctx.db
      .query("savedViews")
      .withIndex("by_owner_resource", (q) =>
        q.eq("organizationId", args.organizationId).eq("ownerUserId", identity.subject).eq("resourceType", domain),
      )
      .collect();

    return views.filter((view) => {
      if (view.recordState !== "active") return false;
      if (args.projectId && (view.scopeType !== "project" || view.scopeId !== args.projectId)) return false;
      if (args.spaceId && (view.scopeType !== "space" || view.scopeId !== args.spaceId)) return false;
      return true;
    });
  },
});

export const getDefaultViews = query({
  args: {
    organizationId: v.string(),
    domain: workOsRecordResourceValidator,
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const views = await ctx.db
      .query("savedViews")
      .withIndex("by_owner_resource", (q) =>
        q.eq("organizationId", args.organizationId).eq("ownerUserId", identity.subject).eq("resourceType", args.domain),
      )
      .collect();
    return views.filter((view) => view.recordState === "active" && view.isDefault);
  },
});

export const getWorkspaceSettings = query({
  args: { organizationId: v.string() },
  returns: v.object({
    organizationId: v.string(),
    viewScope: v.literal("workspace"),
    defaultViews: v.optional(v.record(v.string(), v.array(viewTypeValidator))),
    updatedAt: v.number(),
  }),
  handler: async (_ctx, args) => ({
    organizationId: args.organizationId,
    viewScope: "workspace" as const,
    defaultViews: undefined,
    updatedAt: 0,
  }),
});

export const updateWorkspaceSettings = mutation({
  args: {
    organizationId: v.string(),
    viewScope: v.union(v.literal("space"), v.literal("project"), v.literal("workspace")),
    defaultViews: v.optional(v.record(v.string(), v.array(viewTypeValidator))),
  },
  returns: v.null(),
  handler: async () => null,
});
