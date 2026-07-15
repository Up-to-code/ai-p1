import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { resolveActorTeamIds } from "../access/team";
import type { SavedViewAccessDecision } from "../access/savedViewGrant";
import { getOrganizationRole } from "../permissions";

type Scope = "project" | "space" | "workspace" | "global";

export function scopeForInput(args: {
  scope?: Scope;
  projectId?: string;
  spaceId?: string;
  scopeKey?: string;
}) {
  if (args.projectId) return { scopeType: "project" as const, scopeId: args.projectId };
  if (args.spaceId) return { scopeType: "space" as const, scopeId: args.spaceId };
  if (args.scope === "project") return { scopeType: "project" as const, scopeId: args.scopeKey };
  if (args.scope === "space") return { scopeType: "space" as const, scopeId: args.scopeKey };
  return { scopeType: "workspace" as const, scopeId: args.scopeKey };
}

const ownerCapabilities: SavedViewAccessDecision = {
  canRead: true,
  canConfigure: true,
  canShare: true,
  canDelete: true,
  canSetDefault: true,
};

export function presentSavedView(
  view: Doc<"savedViews">,
  capabilities: SavedViewAccessDecision = ownerCapabilities,
) {
  const scope: Scope =
    view.scopeType === "project"
      ? "project"
      : view.scopeType === "space"
        ? "space"
        : view.scopeId
          ? "workspace"
          : "global";

  return {
    _id: view._id,
    _creationTime: view._creationTime,
    userId: view.ownerUserId ?? view.createdByUserId,
    name: view.name,
    description: view.description,
    resourceType: view.resourceType,
    viewType: view.viewType,
    scope,
    scopeKey: view.scopeId,
    organizationId: view.organizationId,
    projectId: view.scopeType === "project" ? view.scopeId : undefined,
    spaceId: view.scopeType === "space" ? view.scopeId : undefined,
    config: view.config,
    isDefault: view.isDefault,
    sharingMode: view.sharingMode ?? "personal" as const,
    revision: view.revision ?? 1,
    canConfigure: capabilities.canConfigure,
    canShare: capabilities.canShare,
    canDelete: capabilities.canDelete,
    canSetDefault: capabilities.canSetDefault,
    createdAt: view.createdAt,
    updatedAt: view.updatedAt,
  };
}

export async function listViewsForUser(
  ctx: QueryCtx | MutationCtx,
  userId: string,
  args?: {
    resourceType?: Doc<"savedViews">["resourceType"];
    viewType?: Doc<"savedViews">["viewType"];
    organizationId?: string;
    projectId?: string;
    spaceId?: string;
    includeAdministered?: boolean;
  },
) {
  const records = await listViewRecordsForUser(ctx, userId, args);
  return records.map((view) => presentSavedView(view));
}

export async function listViewRecordsForUser(
  ctx: QueryCtx | MutationCtx,
  userId: string,
  args?: {
    resourceType?: Doc<"savedViews">["resourceType"];
    viewType?: Doc<"savedViews">["viewType"];
    organizationId?: string;
    projectId?: string;
    spaceId?: string;
    includeAdministered?: boolean;
  },
) {
  const organizationId = args?.organizationId;
  const resourceType = args?.resourceType;
  if (!organizationId || !resourceType) return [];

  const owned = await ctx.db
    .query("savedViews")
    .withIndex("by_owner_resource", (q) =>
      q.eq("organizationId", organizationId).eq("ownerUserId", userId).eq("resourceType", resourceType),
    )
    .collect();

  const role = args.includeAdministered ? await getOrganizationRole(ctx, organizationId, userId) : null;
  const administered = role === "owner" || role === "admin"
    ? await ctx.db.query("savedViews").withIndex("by_resource_state", (q) =>
      q.eq("organizationId", organizationId).eq("resourceType", resourceType).eq("recordState", "active"),
    ).collect()
    : [];

  const teamIds = await resolveActorTeamIds(ctx, organizationId, userId);
  const grantGroups = await Promise.all([
    ctx.db.query("savedViewGrants").withIndex("by_principal_view", (q) =>
      q.eq("organizationId", organizationId).eq("principalType", "user").eq("principalId", userId),
    ).collect(),
    ...teamIds.map((teamId) => ctx.db.query("savedViewGrants").withIndex("by_principal_view", (q) =>
      q.eq("organizationId", organizationId).eq("principalType", "team").eq("principalId", teamId),
    ).collect()),
  ]);
  const grantedViewIds = [...new Set(grantGroups.flat().filter((grant) => !grant.deletedAt && grant.recordState === "active").map((grant) => grant.viewId))];
  const grantedViews = (await Promise.all(grantedViewIds.map((viewId) => ctx.db.get(viewId))))
    .filter((view): view is Doc<"savedViews"> => view !== null);
  const candidates = [...new Map([...owned, ...grantedViews, ...administered].map((view) => [view._id, view])).values()];

  return candidates.filter((view) => {
    if (view.recordState !== "active") return false;
    if (args.viewType && view.viewType !== args.viewType) return false;
    if (args.projectId && (view.scopeType !== "project" || view.scopeId !== args.projectId)) return false;
    if (args.spaceId && (view.scopeType !== "space" || view.scopeId !== args.spaceId)) return false;
    return true;
  });
}

export async function getDefaultView(
  ctx: QueryCtx | MutationCtx,
  userId: string,
  args: {
    resourceType: Doc<"savedViews">["resourceType"];
    viewType: Doc<"savedViews">["viewType"];
    organizationId?: string;
    projectId?: string;
    spaceId?: string;
  },
) {
  const all = await listViewsForUser(ctx, userId, args);
  return all.find((view) => view.isDefault) ?? all[0] ?? null;
}
