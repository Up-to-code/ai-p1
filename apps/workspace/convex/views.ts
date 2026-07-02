import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createView = mutation({
  args: {
    organizationId: v.string(),
    domain: v.string(),
    spaceId: v.optional(v.id("spaces")),
    projectId: v.optional(v.id("projects")),
    viewConfig: v.object({
      type: v.union(
        v.literal("table"),
        v.literal("board"),
        v.literal("calendar"),
        v.literal("gantt"),
        v.literal("filemanager")
      ),
      label: v.string(),
      filters: v.array(
        v.object({
          field: v.string(),
          operator: v.union(
            v.literal("equals"),
            v.literal("contains"),
            v.literal("startsWith"),
            v.literal("endsWith"),
            v.literal("gt"),
            v.literal("lt"),
            v.literal("gte"),
            v.literal("lte")
          ),
          value: v.any(),
        })
      ),
      sortBy: v.string(),
      sortDirection: v.union(v.literal("asc"), v.literal("desc")),
      groupBy: v.optional(v.string()),
      columns: v.array(
        v.object({
          id: v.string(),
          label: v.string(),
          width: v.optional(v.number()),
          visible: v.optional(v.boolean()),
          sortable: v.optional(v.boolean()),
          filterable: v.optional(v.boolean()),
        })
      ),
      density: v.union(v.literal("compact"), v.literal("normal")),
    }),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.subject;
    const now = Date.now();

    const viewId = await ctx.db.insert("views", {
      organizationId: args.organizationId,
      domain: args.domain,
      spaceId: args.spaceId,
      projectId: args.projectId,
      userId,
      viewConfig: args.viewConfig,
      isDefault: args.isDefault,
      createdByUserId: userId,
      createdAt: now,
      updatedAt: now,
    });

    return viewId;
  },
});

export const updateView = mutation({
  args: {
    viewId: v.id("views"),
    viewConfig: v.object({
      type: v.union(
        v.literal("table"),
        v.literal("board"),
        v.literal("calendar"),
        v.literal("gantt"),
        v.literal("filemanager")
      ),
      label: v.string(),
      filters: v.array(
        v.object({
          field: v.string(),
          operator: v.union(
            v.literal("equals"),
            v.literal("contains"),
            v.literal("startsWith"),
            v.literal("endsWith"),
            v.literal("gt"),
            v.literal("lt"),
            v.literal("gte"),
            v.literal("lte")
          ),
          value: v.any(),
        })
      ),
      sortBy: v.string(),
      sortDirection: v.union(v.literal("asc"), v.literal("desc")),
      groupBy: v.optional(v.string()),
      columns: v.array(
        v.object({
          id: v.string(),
          label: v.string(),
          width: v.optional(v.number()),
          visible: v.optional(v.boolean()),
          sortable: v.optional(v.boolean()),
          filterable: v.optional(v.boolean()),
        })
      ),
      density: v.union(v.literal("compact"), v.literal("normal")),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const view = await ctx.db.get(args.viewId);
    if (!view) {
      throw new Error("View not found");
    }

    await ctx.db.patch(args.viewId, {
      viewConfig: args.viewConfig,
      updatedAt: Date.now(),
    });

    return args.viewId;
  },
});

export const deleteView = mutation({
  args: {
    viewId: v.id("views"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const view = await ctx.db.get(args.viewId);
    if (!view) {
      throw new Error("View not found");
    }

    await ctx.db.patch(args.viewId, {
      deletedAt: Date.now(),
    });

    return args.viewId;
  },
});

export const getViews = query({
  args: {
    organizationId: v.string(),
    domain: v.optional(v.string()),
    spaceId: v.optional(v.id("spaces")),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.subject;

    let views = await ctx.db
      .query("views")
      .withIndex("by_user", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", userId)
      )
      .collect();

    // Filter by domain if provided
    if (args.domain) {
      views = views.filter((v) => v.domain === args.domain);
    }

    // Filter by space if provided
    if (args.spaceId) {
      views = views.filter((v) => v.spaceId === args.spaceId);
    }

    // Filter by project if provided
    if (args.projectId) {
      views = views.filter((v) => v.projectId === args.projectId);
    }

    // Filter out deleted views
    return views.filter((v) => !v.deletedAt);
  },
});

export const getDefaultViews = query({
  args: {
    organizationId: v.string(),
    domain: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.subject;

    const views = await ctx.db
      .query("views")
      .withIndex("by_user_domain", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", userId).eq("domain", args.domain)
      )
      .collect();

    return views.filter((v) => v.isDefault && !v.deletedAt);
  },
});

export const getWorkspaceSettings = query({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("workspaceSettings")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .first();

    return settings;
  },
});

export const updateWorkspaceSettings = mutation({
  args: {
    organizationId: v.string(),
    viewScope: v.union(v.literal("space"), v.literal("project"), v.literal("workspace")),
    defaultViews: v.optional(
      v.record(
        v.string(),
        v.array(
          v.union(
            v.literal("table"),
            v.literal("board"),
            v.literal("calendar"),
            v.literal("gantt"),
            v.literal("filemanager")
          )
        )
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const existingSettings = await ctx.db
      .query("workspaceSettings")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .first();

    if (existingSettings) {
      await ctx.db.patch(existingSettings._id, {
        viewScope: args.viewScope,
        defaultViews: args.defaultViews,
        updatedAt: Date.now(),
      });
      return existingSettings._id;
    } else {
      const settingsId = await ctx.db.insert("workspaceSettings", {
        organizationId: args.organizationId,
        viewScope: args.viewScope,
        defaultViews: args.defaultViews,
        updatedAt: Date.now(),
      });
      return settingsId;
    }
  },
});
