import { ConvexError, v } from "convex/values";
import { mutation } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { assertOrganizationPermission } from "../organizations/profile/access";
import { requireServerActor } from "../access/actor";
import { assertCanReadSavedViewScope } from "../access/savedView";
import {
  assertSavedViewGrantAction,
  resolveSavedViewGrantAccess,
} from "../access/savedViewGrant";
import { savedViewConfigValidator } from "../schema/validators";
import {
  canonicalProjectWorkspaceRoute,
  isProjectWorkspaceViewType,
  PROJECT_WORKSPACE_SURFACE_KEY,
} from "./data";
import {
  ensureSavedView,
  ensureSurface,
  ensureSurfaceTab,
} from "../modelization/data";
import {
  projectWorkspaceCreateInputValidator,
  projectWorkspaceViewTypeValidator,
} from "./validators";

function workspaceError(code: string, message: string) {
  return new ConvexError({ code, message });
}

export const ensureProjectWorkspaceDefaults = mutation({
  args: { organizationId: v.string() },
  returns: v.object({
    surfaceId: v.id("surfaces"),
    viewId: v.id("savedViews"),
    tabId: v.id("surfaceTabs"),
  }),
  handler: async (ctx, args) => {
    const actor = await requireServerActor(ctx);
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    const now = Date.now();
    const view = await ensureSavedView(ctx, {
      organizationId: args.organizationId,
      actorUserId: actor.userId,
      now,
      seed: {
        resourceType: "project",
        viewType: "table",
        name: "Projects",
        description: "Default workspace project table.",
        scopeType: "workspace",
        config: {
          sortBy: "updatedAt",
          sortDirection: "desc",
          density: "normal",
          columnOrder: ["name", "status", "health", "progress", "ownerUserId", "updatedAt"],
          project: {
            visibleFields: ["name", "status", "health", "progress", "ownerUserId", "updatedAt"],
          },
        },
        isDefault: true,
        sourceTemplateId: "default:workspace:project-table",
      },
    });
    const surface = await ensureSurface(ctx, {
      organizationId: args.organizationId,
      actorUserId: actor.userId,
      now,
      seed: {
        key: PROJECT_WORKSPACE_SURFACE_KEY,
        title: "Projects",
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
        savedViewTemplateId: "default:workspace:project-table",
      },
    });
    return { surfaceId: surface.id, viewId: view.id, tabId: tab.id };
  },
});

async function requireProjectSurface(
  ctx: MutationCtx,
  organizationId: string,
  surfaceId: Id<"surfaces">,
) {
  await assertOrganizationPermission(ctx, organizationId, "read");
  const surface = await ctx.db.get(surfaceId);
  if (
    !surface ||
    surface.organizationId !== organizationId ||
    surface.key !== PROJECT_WORKSPACE_SURFACE_KEY ||
    surface.recordState !== "active"
  ) {
    throw workspaceError(
      "PROJECT_WORKSPACE_SURFACE_NOT_FOUND",
      "The Project workspace surface was not found.",
    );
  }
  return surface;
}

async function requireAttachedView(
  ctx: MutationCtx,
  organizationId: string,
  tabId: Id<"surfaceTabs">,
) {
  const tab = await ctx.db.get(tabId);
  if (
    !tab ||
    tab.organizationId !== organizationId ||
    tab.recordState !== "active" ||
    !tab.savedViewId
  ) {
    throw workspaceError("PROJECT_WORKSPACE_TAB_NOT_FOUND", "The view tab was not found.");
  }
  await requireProjectSurface(ctx, organizationId, tab.surfaceId);
  const view = await ctx.db.get(tab.savedViewId);
  if (
    !view ||
    view.organizationId !== organizationId ||
    view.resourceType !== "project" ||
    view.recordState !== "active" ||
    !isProjectWorkspaceViewType(view.viewType)
  ) {
    throw workspaceError("PROJECT_WORKSPACE_VIEW_NOT_FOUND", "The saved Project view was not found.");
  }
  await assertCanReadSavedViewScope(ctx, organizationId, view);
  return { tab, view };
}

async function nextOrder(
  ctx: MutationCtx,
  organizationId: string,
  surfaceId: Id<"surfaces">,
) {
  const tabs = await ctx.db
    .query("surfaceTabs")
    .withIndex("by_surface_state_order", (q) =>
      q
        .eq("organizationId", organizationId)
        .eq("surfaceId", surfaceId)
        .eq("recordState", "active"),
    )
    .collect();
  return Math.max(-10, ...tabs.map((tab) => tab.order)) + 10;
}

async function insertPersonalViewAndTab(
  ctx: MutationCtx,
  args: {
    organizationId: string;
    surfaceId: Id<"surfaces">;
    actorUserId: string;
    viewType: Exclude<Doc<"savedViews">["viewType"], "fileManager">;
    name: string;
    config: Doc<"savedViews">["config"];
    description?: string;
    order?: number;
  },
) {
  const now = Date.now();
  const viewId = await ctx.db.insert("savedViews", {
    organizationId: args.organizationId,
    resourceType: "project",
    viewType: args.viewType,
    name: args.name.trim() || "Untitled view",
    description: args.description,
    ownerUserId: args.actorUserId,
    scopeType: "workspace",
    visibility: "private",
    sharingMode: "personal",
    revision: 1,
    config: args.config,
    isSystemDefault: false,
    isRemovable: true,
    recordState: "active",
    createdByUserId: args.actorUserId,
    createdAt: now,
    updatedAt: now,
  });
  const tabId = await ctx.db.insert("surfaceTabs", {
    organizationId: args.organizationId,
    surfaceId: args.surfaceId,
    tabType: "savedView",
    label: args.name.trim() || "Untitled view",
    order:
      args.order ??
      (await nextOrder(ctx, args.organizationId, args.surfaceId)),
    savedViewId: viewId,
    ownerUserId: args.actorUserId,
    visibility: "private",
    recordState: "active",
    createdByUserId: args.actorUserId,
    createdAt: now,
    updatedAt: now,
  });
  return {
    tabId,
    viewId,
    canonicalRoute: canonicalProjectWorkspaceRoute(args.viewType, viewId),
  };
}

export const createAndAttachView = mutation({
  args: { input: projectWorkspaceCreateInputValidator },
  returns: v.object({
    tabId: v.id("surfaceTabs"),
    viewId: v.id("savedViews"),
    canonicalRoute: v.string(),
  }),
  handler: async (ctx, { input }) => {
    const actor = await requireServerActor(ctx);
    await requireProjectSurface(ctx, input.organizationId, input.surfaceId);
    return insertPersonalViewAndTab(ctx, {
      organizationId: input.organizationId,
      surfaceId: input.surfaceId,
      actorUserId: actor.userId,
      viewType: input.viewType,
      name: input.name,
      config: input.config,
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
    const { tab, view } = await requireAttachedView(ctx, args.organizationId, args.tabId);
    if (!isProjectWorkspaceViewType(view.viewType)) {
      throw workspaceError("PROJECT_WORKSPACE_VIEW_NOT_FOUND", "The saved Project view was not found.");
    }
    if (view.isSystemDefault || !view.isRemovable) {
      throw workspaceError("PROJECT_WORKSPACE_SYSTEM_VIEW", "System Project views cannot be renamed.");
    }
    await assertSavedViewGrantAction(ctx, view, "canConfigure");
    const name = args.name.trim();
    if (!name) throw workspaceError("PROJECT_WORKSPACE_NAME_REQUIRED", "A view name is required.");
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
    await requireProjectSurface(ctx, args.organizationId, args.surfaceId);
    const uniqueIds = [...new Set(args.orderedTabIds)];
    if (uniqueIds.length !== args.orderedTabIds.length) {
      throw workspaceError("PROJECT_WORKSPACE_ORDER_INVALID", "View tab order contains duplicates.");
    }
    for (const [index, tabId] of uniqueIds.entries()) {
      const { tab, view } = await requireAttachedView(ctx, args.organizationId, tabId);
      if (tab.surfaceId !== args.surfaceId) {
        throw workspaceError("PROJECT_WORKSPACE_ORDER_INVALID", "A view tab belongs to another surface.");
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
    const { tab, view } = await requireAttachedView(ctx, args.organizationId, args.tabId);
    if (!isProjectWorkspaceViewType(view.viewType)) {
      throw workspaceError("PROJECT_WORKSPACE_VIEW_NOT_FOUND", "The saved Project view was not found.");
    }
    if (!view.isSystemDefault) {
      const access = await resolveSavedViewGrantAccess(ctx, view);
      if (!access.canRead) throw workspaceError("PROJECT_WORKSPACE_VIEW_DENIED", "You cannot duplicate this view.");
    }
    return insertPersonalViewAndTab(ctx, {
      organizationId: args.organizationId,
      surfaceId: tab.surfaceId,
      actorUserId: actor.userId,
      viewType: view.viewType,
      name: `${view.name} copy`,
      description: view.description,
      config: view.config,
      order: tab.order + 1,
    });
  },
});

export const detachViewTab = mutation({
  args: { organizationId: v.string(), tabId: v.id("surfaceTabs") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireServerActor(ctx);
    const { tab, view } = await requireAttachedView(ctx, args.organizationId, args.tabId);
    if (view.isSystemDefault || !view.isRemovable) {
      throw workspaceError("PROJECT_WORKSPACE_SYSTEM_VIEW", "The default Project view cannot be removed.");
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
        "PROJECT_WORKSPACE_FINAL_TAB",
        "At least one visible Project view must remain attached.",
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
    if (!view || view.organizationId !== args.organizationId || view.resourceType !== "project") {
      throw workspaceError("PROJECT_WORKSPACE_VIEW_NOT_FOUND", "The saved Project view was not found.");
    }
    await assertCanReadSavedViewScope(ctx, args.organizationId, view);
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
    viewType: projectWorkspaceViewTypeValidator,
    config: savedViewConfigValidator,
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const actor = await requireServerActor(ctx);
    await requireProjectSurface(ctx, args.organizationId, args.surfaceId);
    const label = args.viewType[0].toUpperCase() + args.viewType.slice(1);
    const created = await insertPersonalViewAndTab(ctx, {
      organizationId: args.organizationId,
      surfaceId: args.surfaceId,
      actorUserId: actor.userId,
      viewType: args.viewType,
      name: label,
      config: args.config,
    });
    return created.canonicalRoute;
  },
});
