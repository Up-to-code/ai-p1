import { v } from "convex/values";
import { query } from "../_generated/server";
import { savedViewValidator, surfaceTabValidator, surfaceValidator, workflowStateValidator } from "./validators";
import { listActiveSurfaceTabs } from "./data";
import { scopeTypeValidator, viewTypeValidator, workOsRecordResourceValidator } from "../schema/validators";

export const getSurfaceByKey = query({
  args: {
    organizationId: v.string(),
    key: v.string(),
  },
  returns: v.union(surfaceValidator, v.null()),
  handler: async (ctx, args) => {
    const surface = await ctx.db
      .query("surfaces")
      .withIndex("by_organization_key", (q) => q.eq("organizationId", args.organizationId).eq("key", args.key))
      .first();
    if (!surface || surface.recordState !== "active") return null;
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
    const tabs = await listActiveSurfaceTabs(ctx, args.organizationId, args.surfaceId);
    return tabs.sort((a, b) => a.order - b.order);
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

    return views.filter((view) => !args.viewType || view.viewType === args.viewType);
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
