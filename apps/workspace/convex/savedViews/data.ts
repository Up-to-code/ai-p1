import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

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

export function presentSavedView(view: Doc<"savedViews">) {
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
  },
) {
  const records = await listViewRecordsForUser(ctx, userId, args);
  return records.map(presentSavedView);
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
  },
) {
  const organizationId = args?.organizationId;
  const resourceType = args?.resourceType;
  if (!organizationId || !resourceType) return [];

  const all = await ctx.db
    .query("savedViews")
    .withIndex("by_owner_resource", (q) =>
      q.eq("organizationId", organizationId).eq("ownerUserId", userId).eq("resourceType", resourceType),
    )
    .collect();

  return all.filter((view) => {
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
