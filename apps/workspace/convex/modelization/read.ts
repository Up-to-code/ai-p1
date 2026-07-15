import { v } from "convex/values";
import { query } from "../_generated/server";
import { savedViewValidator, surfaceTabValidator, surfaceValidator, workflowStateValidator } from "./validators";
import { listActiveSurfaceTabs } from "./data";
import { scopeTypeValidator, viewTypeValidator, workOsRecordResourceValidator } from "../schema/validators";
import { assertOrganizationPermission } from "../organizations/profile/access";
import { assertCanReadSavedViewScope } from "../access/savedView";
import { resolveSavedViewGrantAccess } from "../access/savedViewGrant";
import { requireServerActor } from "../access/actor";
import type { QueryCtx } from "../_generated/server";

async function assertReadableSurfaceScope(
  ctx: QueryCtx,
  organizationId: string,
  surface: { scopeType: "workspace" | "space" | "project" | "resource"; scopeId?: string },
) {
  await assertOrganizationPermission(ctx, organizationId, "read");
  if (surface.scopeType === "workspace") return;
  if (surface.scopeType === "space" || surface.scopeType === "project") {
    await assertCanReadSavedViewScope(ctx, organizationId, surface);
    return;
  }
  throw new Error("Resource-scoped surfaces require a domain authorization adapter.");
}

export const getSurfaceByKey = query({
  args: {
    organizationId: v.string(),
    key: v.string(),
  },
  returns: v.union(surfaceValidator, v.null()),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    const surface = await ctx.db
      .query("surfaces")
      .withIndex("by_organization_key", (q) => q.eq("organizationId", args.organizationId).eq("key", args.key))
      .first();
    if (!surface || surface.recordState !== "active") return null;
    await assertReadableSurfaceScope(ctx, args.organizationId, surface);
    return surface;
  },
});

export const listSurfaceTabs = query({
  args: {
    organizationId: v.string(),
    surfaceId: v.id("surfaces"),
  },
  returns: v.array(surfaceTabValidator),
  handler: async (ctx, args) => {
    const actor = await requireServerActor(ctx);
    const surface = await ctx.db.get(args.surfaceId);
    if (!surface || surface.organizationId !== args.organizationId || surface.recordState !== "active") return [];
    await assertReadableSurfaceScope(ctx, args.organizationId, surface);
    const tabs = await listActiveSurfaceTabs(ctx, args.organizationId, args.surfaceId);
    return tabs
      .filter((tab) => tab.visibility !== "private" || tab.ownerUserId === actor.userId || tab.createdByUserId === actor.userId)
      .sort((a, b) => a.order - b.order);
  },
});

export const listSavedViews = query({
  args: {
    organizationId: v.string(),
    resourceType: workOsRecordResourceValidator,
    scopeType: scopeTypeValidator,
    scopeId: v.optional(v.string()),
    viewType: v.optional(viewTypeValidator),
  },
  returns: v.array(savedViewValidator),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    const views = await ctx.db
      .query("savedViews")
      .withIndex("by_resource_scope_state", (q) =>
        q
          .eq("organizationId", args.organizationId)
          .eq("resourceType", args.resourceType)
          .eq("scopeType", args.scopeType)
          .eq("scopeId", args.scopeId)
          .eq("recordState", "active"),
      )
      .collect();

    const decisions = await Promise.all(views.map(async (view) => {
      if (args.viewType && view.viewType !== args.viewType) return null;
      try {
        await assertCanReadSavedViewScope(ctx, args.organizationId, view);
        if (view.isSystemDefault) return view;
        return (await resolveSavedViewGrantAccess(ctx, view)).canRead ? view : null;
      } catch {
        return null;
      }
    }));
    return decisions.filter((view): view is NonNullable<typeof view> => view !== null);
  },
});

export const listWorkflowStates = query({
  args: {
    organizationId: v.string(),
    resourceType: workOsRecordResourceValidator,
    workflowKey: v.string(),
  },
  returns: v.array(workflowStateValidator),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    const workflow = await ctx.db
      .query("workflowDefinitions")
      .withIndex("by_resource_key", (q) =>
        q.eq("organizationId", args.organizationId).eq("resourceType", args.resourceType).eq("key", args.workflowKey),
      )
      .first();
    if (!workflow || workflow.recordState !== "active") return [];

    const states = await ctx.db
      .query("workflowStates")
      .withIndex("by_workflow_state_order", (q) =>
        q.eq("organizationId", args.organizationId).eq("workflowId", workflow._id).eq("recordState", "active"),
      )
      .collect();
    return states.sort((a, b) => a.order - b.order);
  },
});
