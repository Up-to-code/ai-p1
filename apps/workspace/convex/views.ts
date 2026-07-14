import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { savedViewFilterValidator, savedViewColumnValidator, viewTypeValidator, workOsRecordResourceValidator } from "./schema/validators";
import { assertCanReadSavedViewScope, filterReadableSavedViews } from "./access/savedView";
import { assertOrganizationPermission } from "./organizations/profile/access";
import { requireServerActor } from "./access/actor";
import { assertSavedViewGrantAction, resolveSavedViewGrantAccess } from "./access/savedViewGrant";
import { listViewRecordsForUser } from "./savedViews/data";

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
    const actor = await requireServerActor(ctx);
    await assertOrganizationPermission(ctx, args.organizationId, "read");

    const now = Date.now();
    const scope = args.projectId
      ? { scopeType: "project" as const, scopeId: args.projectId }
      : args.spaceId
        ? { scopeType: "space" as const, scopeId: args.spaceId }
        : { scopeType: "workspace" as const, scopeId: undefined };
    await assertCanReadSavedViewScope(ctx, args.organizationId, scope);

    return await ctx.db.insert("savedViews", {
      organizationId: args.organizationId,
      resourceType: args.domain,
      viewType: args.viewConfig.type,
      name: args.viewConfig.label,
      ownerUserId: actor.userId,
      scopeType: scope.scopeType,
      scopeId: scope.scopeId,
      visibility: "private",
      sharingMode: "personal",
      revision: 1,
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
      createdByUserId: actor.userId,
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
    await requireServerActor(ctx);

    const view = await ctx.db.get(args.viewId);
    if (!view) throw new Error("View not found");
    await assertOrganizationPermission(ctx, view.organizationId, "read");
    await assertCanReadSavedViewScope(ctx, view.organizationId, view);
    await assertSavedViewGrantAction(ctx, view, "canConfigure");

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
      revision: (view.revision ?? 1) + 1,
    });
    return args.viewId;
  },
});

export const deleteView = mutation({
  args: { viewId: v.id("savedViews") },
  returns: v.id("savedViews"),
  handler: async (ctx, args) => {
    await requireServerActor(ctx);

    const view = await ctx.db.get(args.viewId);
    if (!view) throw new Error("View not found");
    await assertOrganizationPermission(ctx, view.organizationId, "read");
    await assertCanReadSavedViewScope(ctx, view.organizationId, view);
    await assertSavedViewGrantAction(ctx, view, "canDelete");

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
    const actor = await requireServerActor(ctx);
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    await assertCanReadSavedViewScope(ctx, args.organizationId, args.projectId
      ? { scopeType: "project", scopeId: args.projectId }
      : args.spaceId
        ? { scopeType: "space", scopeId: args.spaceId }
        : { scopeType: "workspace" });

    const domain = args.domain;
    if (!domain) return [];
    const views = await listViewRecordsForUser(ctx, actor.userId, { organizationId: args.organizationId, resourceType: domain, projectId: args.projectId, spaceId: args.spaceId, includeAdministered: true });

    const matching = views.filter((view) => {
      if (view.recordState !== "active") return false;
      if (args.projectId && (view.scopeType !== "project" || view.scopeId !== args.projectId)) return false;
      if (args.spaceId && (view.scopeType !== "space" || view.scopeId !== args.spaceId)) return false;
      return true;
    });
    const scoped = await filterReadableSavedViews(ctx, args.organizationId, matching);
    const decisions = await Promise.all(scoped.map(async (view) => (await resolveSavedViewGrantAccess(ctx, view)).canRead ? view : null));
    return decisions.filter((view): view is NonNullable<typeof view> => view !== null);
  },
});

export const getDefaultViews = query({
  args: {
    organizationId: v.string(),
    domain: workOsRecordResourceValidator,
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const actor = await requireServerActor(ctx);
    await assertOrganizationPermission(ctx, args.organizationId, "read");

    const views = await listViewRecordsForUser(ctx, actor.userId, { organizationId: args.organizationId, resourceType: args.domain });
    const defaults = views.filter((view) => view.recordState === "active" && view.isDefault);
    const scoped = await filterReadableSavedViews(ctx, args.organizationId, defaults);
    const decisions = await Promise.all(scoped.map(async (view) => (await resolveSavedViewGrantAccess(ctx, view)).canRead ? view : null));
    return decisions.filter((view): view is NonNullable<typeof view> => view !== null);
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
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    return {
      organizationId: args.organizationId,
      viewScope: "workspace" as const,
      defaultViews: undefined,
      updatedAt: 0,
    };
  },
});

export const updateWorkspaceSettings = mutation({
  args: {
    organizationId: v.string(),
    viewScope: v.union(v.literal("space"), v.literal("project"), v.literal("workspace")),
    defaultViews: v.optional(v.record(v.string(), v.array(viewTypeValidator))),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "update");
    return null;
  },
});
