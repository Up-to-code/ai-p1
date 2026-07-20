import { ConvexError } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { assertOrganizationPermission } from "../organizations/profile/access";
import { requireServerActor } from "../access/actor";
import { assertCanReadSavedViewScope } from "../access/savedView";
import {
  assertSavedViewGrantAction,
  resolveSavedViewGrantAccess,
  type SavedViewAccessDecision,
} from "../access/savedViewGrant";
import {
  ensureSavedView,
  ensureSurface,
  ensureSurfaceTab,
} from "../modelization/data";

export type SurfaceConfig = {
  key: string;
  resourceType: string;
  canonicalRoute: string;
  viewTypeGuard: (vt: Doc<"savedViews">["viewType"]) => boolean;
  buildRoute: (viewType: string, savedViewId?: string) => string;
};

export type SurfaceTabProjection = {
  id: Id<"surfaceTabs">;
  label: string;
  icon?: string;
  order: number;
  canonicalRoute: string;
  savedView: {
    id: Id<"savedViews">;
    name: string;
    viewType: Doc<"savedViews">["viewType"];
    config: Doc<"savedViews">["config"];
    sharingMode: "personal" | "shared" | "protected";
    revision: number;
    isSystemDefault: boolean;
  };
  capabilities: {
    canRename: boolean;
    canReorder: boolean;
    canDuplicate: boolean;
    canShare: boolean;
    canRemove: boolean;
  };
};

export type SurfaceProjection = {
  surface: {
    id: Id<"surfaces">;
    key: string;
    title: string;
    canonicalRoute: string;
  };
  tabs: SurfaceTabProjection[];
  capabilities: { canCreateView: boolean };
};

function surfaceError(code: string, message: string) {
  return new ConvexError({ code, message });
}

async function accessForView(
  ctx: QueryCtx,
  view: Doc<"savedViews">,
): Promise<SavedViewAccessDecision | null> {
  try {
    await assertCanReadSavedViewScope(ctx, view.organizationId, view);
    if (view.isSystemDefault) {
      return {
        canRead: true,
        canConfigure: false,
        canShare: false,
        canDelete: false,
        canSetDefault: false,
      };
    }
    const access = await resolveSavedViewGrantAccess(ctx, view);
    return access.canRead ? access : null;
  } catch {
    return null;
  }
}

export async function projectTabProjection(
  ctx: QueryCtx,
  tab: Doc<"surfaceTabs">,
  config: SurfaceConfig,
): Promise<SurfaceTabProjection | null> {
  if (tab.recordState !== "active" || !tab.savedViewId) return null;
  const view = await ctx.db.get(tab.savedViewId);
  if (
    !view ||
    view.recordState !== "active" ||
    view.resourceType !== config.resourceType ||
    !config.viewTypeGuard(view.viewType)
  ) {
    return null;
  }
  const access = await accessForView(ctx, view);
  if (!access) return null;
  const removable = view.isRemovable && !view.isSystemDefault;
  return {
    id: tab._id,
    label: tab.label,
    icon: tab.icon,
    order: tab.order,
    canonicalRoute: config.buildRoute(
      view.viewType,
      view.isSystemDefault ? undefined : view._id,
    ),
    savedView: {
      id: view._id,
      name: view.name,
      viewType: view.viewType,
      config: view.config,
      sharingMode: view.sharingMode ?? (view.isSystemDefault ? "shared" : "personal"),
      revision: view.revision ?? 1,
      isSystemDefault: view.isSystemDefault ?? false,
    },
    capabilities: {
      canRename: removable && access.canConfigure,
      canReorder: access.canConfigure,
      canDuplicate: access.canRead,
      canShare: removable && access.canShare,
      canRemove: removable && access.canConfigure,
    },
  };
}

export async function readableSurfaceTabs(
  ctx: QueryCtx,
  organizationId: string,
  surfaceId: Id<"surfaces">,
  config: SurfaceConfig,
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
  const projected = await Promise.all(
    tabs.map((tab) => projectTabProjection(ctx, tab, config)),
  );
  return projected
    .filter((tab): tab is SurfaceTabProjection => tab !== null)
    .sort((left, right) => left.order - right.order);
}

export async function getSurfaceByKey(
  ctx: QueryCtx,
  organizationId: string,
  key: string,
) {
  const surface = await ctx.db
    .query("surfaces")
    .withIndex("by_organization_key", (q) =>
      q.eq("organizationId", organizationId).eq("key", key),
    )
    .first();
  if (!surface || surface.recordState !== "active") return null;
  return surface;
}

export async function buildSurfaceProjection(
  ctx: QueryCtx,
  organizationId: string,
  config: SurfaceConfig,
): Promise<SurfaceProjection | null> {
  await assertOrganizationPermission(ctx, organizationId, "read");
  const surface = await getSurfaceByKey(ctx, organizationId, config.key);
  if (!surface) return null;
  return {
    surface: {
      id: surface._id,
      key: surface.key,
      title: surface.title,
      canonicalRoute: config.canonicalRoute,
    },
    tabs: await readableSurfaceTabs(ctx, organizationId, surface._id, config),
    capabilities: { canCreateView: true },
  };
}

export async function requireSurface(
  ctx: MutationCtx,
  organizationId: string,
  surfaceId: Id<"surfaces">,
  config: SurfaceConfig,
  errorPrefix: string,
) {
  await assertOrganizationPermission(ctx, organizationId, "read");
  const surface = await ctx.db.get(surfaceId);
  if (
    !surface ||
    surface.organizationId !== organizationId ||
    surface.key !== config.key ||
    surface.recordState !== "active"
  ) {
    throw surfaceError(
      `${errorPrefix}_SURFACE_NOT_FOUND`,
      `The ${errorPrefix} workspace surface was not found.`,
    );
  }
  return surface;
}

export async function requireAttachedView(
  ctx: MutationCtx,
  organizationId: string,
  tabId: Id<"surfaceTabs">,
  config: SurfaceConfig,
  errorPrefix: string,
) {
  const tab = await ctx.db.get(tabId);
  if (
    !tab ||
    tab.organizationId !== organizationId ||
    tab.recordState !== "active" ||
    !tab.savedViewId
  ) {
    throw surfaceError(`${errorPrefix}_TAB_NOT_FOUND`, "The view tab was not found.");
  }
  await requireSurface(ctx, organizationId, tab.surfaceId, config, errorPrefix);
  const view = await ctx.db.get(tab.savedViewId);
  if (
    !view ||
    view.organizationId !== organizationId ||
    view.resourceType !== config.resourceType ||
    view.recordState !== "active" ||
    !config.viewTypeGuard(view.viewType)
  ) {
    throw surfaceError(`${errorPrefix}_VIEW_NOT_FOUND`, `The saved view was not found.`);
  }
  await assertCanReadSavedViewScope(ctx, organizationId, view);
  return { tab, view };
}

export async function nextOrder(
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

export async function insertPersonalViewAndTab(
  ctx: MutationCtx,
  args: {
    organizationId: string;
    surfaceId: Id<"surfaces">;
    actorUserId: string;
    viewType: Doc<"savedViews">["viewType"];
    resourceType: Doc<"savedViews">["resourceType"];
    name: string;
    config: Doc<"savedViews">["config"];
    buildRoute: (viewType: string, savedViewId?: string) => string;
    description?: string;
    order?: number;
  },
) {
  const now = Date.now();
  const viewId = await ctx.db.insert("savedViews", {
    organizationId: args.organizationId,
    resourceType: args.resourceType,
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
    order: args.order ?? (await nextOrder(ctx, args.organizationId, args.surfaceId)),
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
    canonicalRoute: args.buildRoute(args.viewType, viewId),
  };
}
