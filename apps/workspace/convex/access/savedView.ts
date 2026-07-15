import { ConvexError } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { resolveProjectAccess } from "./project";
import { resolveSpaceAccess } from "./space";

type SavedViewAccessCtx = Pick<QueryCtx | MutationCtx, "auth" | "db" | "runQuery">;

export type SavedViewScopeRef = Readonly<{
  scopeType: Doc<"savedViews">["scopeType"];
  scopeId?: string;
}>;

function scopeError(
  code: "SAVED_VIEW_SCOPE_INVALID" | "SAVED_VIEW_SCOPE_DENIED",
  organizationId: string,
  scope: SavedViewScopeRef,
  message: string,
) {
  return new ConvexError({
    code,
    organizationId,
    scopeType: scope.scopeType,
    scopeId: scope.scopeId,
    message,
  });
}

function isActiveOrganizationRecord(
  record: { organizationId: string; deletedAt?: number; recordState?: string },
  organizationId: string,
): boolean {
  return record.organizationId === organizationId
    && !record.deletedAt
    && record.recordState !== "deleted";
}

/**
 * Requires record-aware read access to the Project or Space that owns a saved
 * view. Workspace views rely on the caller's Organization membership check.
 */
export async function assertCanReadSavedViewScope(
  ctx: SavedViewAccessCtx,
  organizationId: string,
  scope: SavedViewScopeRef,
): Promise<void> {
  if (scope.scopeType === "workspace" && !scope.scopeId) return;
  if (scope.scopeType !== "project" && scope.scopeType !== "space") {
    throw scopeError(
      "SAVED_VIEW_SCOPE_INVALID",
      organizationId,
      scope,
      "Saved view scope is invalid.",
    );
  }
  if (!scope.scopeId) {
    throw scopeError(
      "SAVED_VIEW_SCOPE_INVALID",
      organizationId,
      scope,
      "Saved view scope requires a record identifier.",
    );
  }

  if (scope.scopeType === "project") {
    const projectId = ctx.db.normalizeId("projects", scope.scopeId);
    if (!projectId) {
      throw scopeError("SAVED_VIEW_SCOPE_INVALID", organizationId, scope, "Saved view Project scope is invalid.");
    }
    const [project, access] = await Promise.all([
      ctx.db.get(projectId),
      resolveProjectAccess(ctx, organizationId),
    ]);
    if (!project || !isActiveOrganizationRecord(project, organizationId)) {
      throw scopeError("SAVED_VIEW_SCOPE_INVALID", organizationId, scope, "Saved view Project scope is not active in this organization.");
    }
    if (!access.canRead(project)) {
      throw scopeError("SAVED_VIEW_SCOPE_DENIED", organizationId, scope, "You cannot read the Project that owns this saved view.");
    }
    return;
  }

  const spaceId = ctx.db.normalizeId("spaces", scope.scopeId);
  if (!spaceId) {
    throw scopeError("SAVED_VIEW_SCOPE_INVALID", organizationId, scope, "Saved view Space scope is invalid.");
  }
  const [space, access] = await Promise.all([
    ctx.db.get(spaceId),
    resolveSpaceAccess(ctx, organizationId),
  ]);
  if (!space || !isActiveOrganizationRecord(space, organizationId)) {
    throw scopeError("SAVED_VIEW_SCOPE_INVALID", organizationId, scope, "Saved view Space scope is not active in this organization.");
  }
  if (!access.canRead(space)) {
    throw scopeError("SAVED_VIEW_SCOPE_DENIED", organizationId, scope, "You cannot read the Space that owns this saved view.");
  }
}

/** Filters saved views after re-evaluating their current parent access. */
export async function filterReadableSavedViews(
  ctx: SavedViewAccessCtx,
  organizationId: string,
  views: readonly Doc<"savedViews">[],
): Promise<Doc<"savedViews">[]> {
  const decisions = await Promise.all(views.map(async (view) => {
    try {
      await assertCanReadSavedViewScope(ctx, organizationId, view);
      return view;
    } catch {
      return null;
    }
  }));
  return decisions.filter((view): view is Doc<"savedViews"> => view !== null);
}
