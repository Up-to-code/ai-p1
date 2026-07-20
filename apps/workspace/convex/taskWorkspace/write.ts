import { ConvexError, v } from "convex/values";
import { mutation } from "../_generated/server";
import { requireServerActor } from "../access/actor";
import { assertOrganizationPermission } from "../organizations/profile/access";
import {
  assertSavedViewGrantAction,
  resolveSavedViewGrantAccess,
} from "../access/savedViewGrant";
import { assertCanReadSavedViewScope } from "../access/savedView";
import {
  requireSurface,
  requireAttachedView,
  insertPersonalViewAndTab,
} from "../workspaceSurfaces/helpers";
import { savedViewConfigValidator } from "../schema/validators";
import {
  TASK_WORKSPACE_SURFACE_CONFIG,
  canonicalTaskWorkspaceRoute,
  isTaskWorkspaceViewType,
} from "./data";
import {
  taskWorkspaceCreateInputValidator,
  taskWorkspaceViewTypeValidator,
} from "./validators";

function workspaceError(code: string, message: string) {
  return new ConvexError({ code, message });
}

export const ensureTaskWorkspaceDefaults = mutation({
  args: { organizationId: v.string() },
  returns: v.object({
    surfaceId: v.id("surfaces"),
    viewId: v.id("savedViews"),
    tabId: v.id("surfaceTabs"),
  }),
  handler: async (ctx, args) => {
    const actor = await requireServerActor(ctx);
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    const { ensureSavedView, ensureSurface, ensureSurfaceTab } = await import("../modelization/data");
    const now = Date.now();
    const view = await ensureSavedView(ctx, {
      organizationId: args.organizationId,
      actorUserId: actor.userId,
      now,
      seed: {
        resourceType: "task",
        viewType: "table",
        name: "Tasks",
        description: "Default workspace task table.",
        scopeType: "workspace",
        config: {
          sortBy: "updatedAt",
          sortDirection: "desc",
          density: "normal",
          columnOrder: ["title", "status", "priority", "dueDate", "assigneeId"],
        },
        isDefault: true,
        sourceTemplateId: "default:workspace:task-table",
      },
    });
    const surface = await ensureSurface(ctx, {
      organizationId: args.organizationId,
      actorUserId: actor.userId,
      now,
      seed: {
        key: TASK_WORKSPACE_SURFACE_CONFIG.key,
        title: "Tasks",
        scopeType: "workspace",
      },
    });
    const tab = await ensureSurfaceTab(ctx, {
      organizationId: args.organizationId,
      surfaceId: surface.id,
      actorUserId: actor.userId,
      savedViewId: view.id,
      now,
      seed: {
        label: "Table",
        icon: "table",
        order: 0,
        tabType: "savedView",
        savedViewTemplateId: "default:workspace:task-table",
      },
    });
    return { surfaceId: surface.id, viewId: view.id, tabId: tab.id };
  },
});

export const createAndAttachView = mutation({
  args: { input: taskWorkspaceCreateInputValidator },
  returns: v.object({
    tabId: v.id("surfaceTabs"),
    viewId: v.id("savedViews"),
    canonicalRoute: v.string(),
  }),
  handler: async (ctx, { input }) => {
    const actor = await requireServerActor(ctx);
    await requireSurface(ctx, input.organizationId, input.surfaceId, TASK_WORKSPACE_SURFACE_CONFIG, "TASK_WORKSPACE");
    return insertPersonalViewAndTab(ctx, {
      organizationId: input.organizationId,
      surfaceId: input.surfaceId,
      actorUserId: actor.userId,
      viewType: input.viewType,
      resourceType: "task",
      name: input.name,
      config: input.config,
      buildRoute: TASK_WORKSPACE_SURFACE_CONFIG.buildRoute,
    });
  },
});

export const renameViewTab = mutation({
  args: {
    organizationId: v.string(),
    tabId: v.id("surfaceTabs"),
    name: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireServerActor(ctx);
    const { tab, view } = await requireAttachedView(
      ctx, args.organizationId, args.tabId, TASK_WORKSPACE_SURFACE_CONFIG, "TASK_WORKSPACE",
    );
    if (!isTaskWorkspaceViewType(view.viewType)) {
      throw workspaceError("TASK_WORKSPACE_VIEW_NOT_FOUND", "The saved Task view was not found.");
    }
    if (view.isSystemDefault || !view.isRemovable) {
      throw workspaceError("TASK_WORKSPACE_SYSTEM_VIEW", "System Task views cannot be renamed.");
    }
    await assertSavedViewGrantAction(ctx, view, "canConfigure");
    const name = args.name.trim();
    if (!name) throw workspaceError("TASK_WORKSPACE_NAME_REQUIRED", "A view name is required.");
    const now = Date.now();
    await ctx.db.patch(tab._id, { label: name, updatedAt: now });
    await ctx.db.patch(view._id, {
      name,
      revision: (view.revision ?? 1) + 1,
      updatedAt: now,
    });
    return null;
  },
});

export const reorderViewTabs = mutation({
  args: {
    organizationId: v.string(),
    surfaceId: v.id("surfaces"),
    orderedTabIds: v.array(v.id("surfaceTabs")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireServerActor(ctx);
    await requireSurface(ctx, args.organizationId, args.surfaceId, TASK_WORKSPACE_SURFACE_CONFIG, "TASK_WORKSPACE");
    const uniqueIds = [...new Set(args.orderedTabIds)];
    if (uniqueIds.length !== args.orderedTabIds.length) {
      throw workspaceError("TASK_WORKSPACE_ORDER_INVALID", "View tab order contains duplicates.");
    }
    for (const [index, tabId] of uniqueIds.entries()) {
      const { tab, view } = await requireAttachedView(
        ctx, args.organizationId, tabId, TASK_WORKSPACE_SURFACE_CONFIG, "TASK_WORKSPACE",
      );
      if (tab.surfaceId !== args.surfaceId) {
        throw workspaceError("TASK_WORKSPACE_ORDER_INVALID", "A view tab belongs to another surface.");
      }
      if (!view.isSystemDefault) {
        await assertSavedViewGrantAction(ctx, view, "canConfigure");
      }
      await ctx.db.patch(tab._id, { order: index * 10, updatedAt: Date.now() });
    }
    return null;
  },
});

export const duplicateViewTab = mutation({
  args: { organizationId: v.string(), tabId: v.id("surfaceTabs") },
  returns: v.object({
    tabId: v.id("surfaceTabs"),
    viewId: v.id("savedViews"),
    canonicalRoute: v.string(),
  }),
  handler: async (ctx, args) => {
    const actor = await requireServerActor(ctx);
    const { tab, view } = await requireAttachedView(
      ctx, args.organizationId, args.tabId, TASK_WORKSPACE_SURFACE_CONFIG, "TASK_WORKSPACE",
    );
    if (!isTaskWorkspaceViewType(view.viewType)) {
      throw workspaceError("TASK_WORKSPACE_VIEW_NOT_FOUND", "The saved Task view was not found.");
    }
    if (!view.isSystemDefault) {
      const access = await resolveSavedViewGrantAccess(ctx, view);
      if (!access.canRead) throw workspaceError("TASK_WORKSPACE_VIEW_DENIED", "You cannot duplicate this view.");
    }
    return insertPersonalViewAndTab(ctx, {
      organizationId: args.organizationId,
      surfaceId: tab.surfaceId,
      actorUserId: actor.userId,
      viewType: view.viewType,
      resourceType: "task",
      name: `${view.name} copy`,
      description: view.description,
      config: view.config,
      order: tab.order + 1,
      buildRoute: TASK_WORKSPACE_SURFACE_CONFIG.buildRoute,
    });
  },
});

export const detachViewTab = mutation({
  args: { organizationId: v.string(), tabId: v.id("surfaceTabs") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireServerActor(ctx);
    const { tab, view } = await requireAttachedView(
      ctx, args.organizationId, args.tabId, TASK_WORKSPACE_SURFACE_CONFIG, "TASK_WORKSPACE",
    );
    if (view.isSystemDefault || !view.isRemovable) {
      throw workspaceError("TASK_WORKSPACE_SYSTEM_VIEW", "The default Task view cannot be removed.");
    }
    await assertSavedViewGrantAction(ctx, view, "canConfigure");
    const tabs = await ctx.db
      .query("surfaceTabs")
      .withIndex("by_surface_state_order", (q) =>
        q
          .eq("organizationId", args.organizationId)
          .eq("surfaceId", tab.surfaceId)
          .eq("recordState", "active"),
      )
      .collect();
    let readableCount = 0;
    for (const candidate of tabs) {
      if (!candidate.savedViewId) continue;
      const candidateView = await ctx.db.get(candidate.savedViewId);
      if (!candidateView || candidateView.recordState !== "active") continue;
      try {
        await assertCanReadSavedViewScope(ctx, args.organizationId, candidateView);
        if (candidateView.isSystemDefault) readableCount += 1;
        else if ((await resolveSavedViewGrantAccess(ctx, candidateView)).canRead) readableCount += 1;
      } catch {
        // An omitted view cannot satisfy the final-visible-tab invariant.
      }
    }
    if (readableCount <= 1) {
      throw workspaceError(
        "TASK_WORKSPACE_FINAL_TAB",
        "At least one visible Task view must remain attached.",
      );
    }
    const now = Date.now();
    await ctx.db.patch(tab._id, {
      recordState: "deleted",
      deletedAt: now,
      updatedAt: now,
    });
    return null;
  },
});

export const updateViewConfig = mutation({
  args: {
    organizationId: v.string(),
    viewId: v.id("savedViews"),
    config: savedViewConfigValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireServerActor(ctx);
    const view = await ctx.db.get(args.viewId);
    if (!view || view.organizationId !== args.organizationId || view.resourceType !== "task") {
      throw workspaceError("TASK_WORKSPACE_VIEW_NOT_FOUND", "The saved Task view was not found.");
    }
    await assertSavedViewGrantAction(ctx, view, "canConfigure");
    await ctx.db.patch(view._id, {
      config: args.config,
      revision: (view.revision ?? 1) + 1,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const createDefaultRouteView = mutation({
  args: {
    organizationId: v.string(),
    surfaceId: v.id("surfaces"),
    viewType: taskWorkspaceViewTypeValidator,
    config: savedViewConfigValidator,
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const actor = await requireServerActor(ctx);
    await requireSurface(ctx, args.organizationId, args.surfaceId, TASK_WORKSPACE_SURFACE_CONFIG, "TASK_WORKSPACE");
    const label = args.viewType[0].toUpperCase() + args.viewType.slice(1);
    const created = await insertPersonalViewAndTab(ctx, {
      organizationId: args.organizationId,
      surfaceId: args.surfaceId,
      actorUserId: actor.userId,
      viewType: args.viewType,
      resourceType: "task",
      name: label,
      config: args.config,
      buildRoute: TASK_WORKSPACE_SURFACE_CONFIG.buildRoute,
    });
    return created.canonicalRoute;
  },
});
