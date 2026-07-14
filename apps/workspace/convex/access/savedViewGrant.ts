import { ConvexError } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { getOrganizationRole } from "../permissions";
import { requireServerActor } from "./actor";
import { resolveActorTeamIds } from "./team";

type SavedViewGrantCtx = Pick<QueryCtx | MutationCtx, "auth" | "db" | "runQuery">;

export type SavedViewAccessDecision = Readonly<{
  canRead: boolean;
  canConfigure: boolean;
  canShare: boolean;
  canDelete: boolean;
  canSetDefault: boolean;
}>;

function denied(view: Doc<"savedViews">, action: keyof SavedViewAccessDecision) {
  return new ConvexError({
    code: "SAVED_VIEW_ACCESS_DENIED",
    message: `You cannot ${action.replace(/^can/, "").toLowerCase()} this saved view.`,
    organizationId: view.organizationId,
    viewId: view._id,
  });
}

/** Applies owner, administrator, direct-user, and live Better Auth Team grants. */
export async function resolveSavedViewGrantAccess(
  ctx: SavedViewGrantCtx,
  view: Doc<"savedViews">,
): Promise<SavedViewAccessDecision> {
  const actor = await requireServerActor(ctx);
  const owner = view.ownerUserId === actor.userId || view.createdByUserId === actor.userId;
  const sharingMode = view.sharingMode ?? "personal";
  if (owner) return { canRead: true, canConfigure: true, canShare: true, canDelete: true, canSetDefault: true };
  if (sharingMode === "personal" || view.organizationId.startsWith("personal:")) {
    return { canRead: false, canConfigure: false, canShare: false, canDelete: false, canSetDefault: false };
  }
  const [role, teamIds, grants] = await Promise.all([
    getOrganizationRole(ctx, view.organizationId, actor.userId),
    resolveActorTeamIds(ctx, view.organizationId, actor.userId),
    ctx.db.query("savedViewGrants").withIndex("by_view_state", (q) =>
      q.eq("organizationId", view.organizationId).eq("viewId", view._id).eq("recordState", "active"),
    ).collect(),
  ]);
  const administrator = role === "owner" || role === "admin";
  const matching = grants.filter((grant) =>
    !grant.deletedAt && (
      (grant.principalType === "user" && grant.principalId === actor.userId) ||
      (grant.principalType === "team" && teamIds.includes(grant.principalId))
    ),
  );
  const canRead = administrator || matching.length > 0;
  const canConfigure = administrator || matching.some((grant) => grant.access === "configure");
  return {
    canRead,
    canConfigure,
    canShare: administrator,
    canDelete: administrator,
    canSetDefault: false,
  };
}

export async function assertSavedViewGrantAction(
  ctx: SavedViewGrantCtx,
  view: Doc<"savedViews">,
  action: keyof SavedViewAccessDecision,
) {
  const decision = await resolveSavedViewGrantAccess(ctx, view);
  if (!decision[action]) throw denied(view, action);
  return decision;
}
