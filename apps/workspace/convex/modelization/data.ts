import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type DbCtx = QueryCtx | MutationCtx;
type ResourceType = Doc<"savedViews">["resourceType"];
type ViewType = Doc<"savedViews">["viewType"];
type ScopeType = Doc<"surfaces">["scopeType"];
type WorkflowCategory = Doc<"workflowStates">["category"];
type SavedViewConfig = Doc<"savedViews">["config"];

export type WorkflowSeed = {
  resourceType: ResourceType;
  key: string;
  name: string;
  states: Array<{
    key: string;
    label: string;
    color: string;
    order: number;
    category: WorkflowCategory;
    isDefault?: boolean;
    isTerminal?: boolean;
    isRemovable?: boolean;
  }>;
};

export type SavedViewSeed = {
  resourceType: ResourceType;
  viewType: ViewType;
  name: string;
  description?: string;
  scopeType: ScopeType;
  scopeId?: string;
  visibility?: Doc<"savedViews">["visibility"];
  config: SavedViewConfig;
  isDefault?: boolean;
  sourceTemplateId: string;
};

export type SurfaceSeed = {
  key: string;
  title: string;
  scopeType: ScopeType;
  scopeId?: string;
  visibility?: Doc<"surfaces">["visibility"];
};

export type SurfaceTabSeed = {
  label: string;
  icon?: string;
  order: number;
  tabType: Doc<"surfaceTabs">["tabType"];
  savedViewTemplateId?: string;
  systemKey?: string;
  recordType?: ResourceType;
  recordId?: string;
  visibility?: Doc<"surfaceTabs">["visibility"];
};

export async function ensureWorkflowDefinition(
  ctx: MutationCtx,
  args: {
    organizationId: string;
    actorUserId: string;
    seed: WorkflowSeed;
    now: number;
  },
) {
  const existing = await ctx.db
    .query("workflowDefinitions")
    .withIndex("by_resource_key", (q) =>
      q.eq("organizationId", args.organizationId).eq("resourceType", args.seed.resourceType).eq("key", args.seed.key),
    )
    .first();

  if (existing) return { id: existing._id, created: false };

  const id = await ctx.db.insert("workflowDefinitions", {
    organizationId: args.organizationId,
    resourceType: args.seed.resourceType,
    key: args.seed.key,
    name: args.seed.name,
    isDefault: true,
    isRemovable: false,
    sourceTemplateId: `default:${args.seed.key}`,
    recordState: "active",
    createdByUserId: args.actorUserId,
    createdAt: args.now,
    updatedAt: args.now,
  });

  return { id, created: true };
}

export async function ensureWorkflowState(
  ctx: MutationCtx,
  args: {
    organizationId: string;
    workflowId: Id<"workflowDefinitions">;
    actorUserId: string;
    seed: WorkflowSeed["states"][number];
    sourceTemplateId: string;
    now: number;
  },
) {
  const existing = await ctx.db
    .query("workflowStates")
    .withIndex("by_workflow_key", (q) =>
      q.eq("organizationId", args.organizationId).eq("workflowId", args.workflowId).eq("key", args.seed.key),
    )
    .first();

  if (existing) return { id: existing._id, created: false };

  const id = await ctx.db.insert("workflowStates", {
    organizationId: args.organizationId,
    workflowId: args.workflowId,
    key: args.seed.key,
    label: args.seed.label,
    color: args.seed.color,
    order: args.seed.order,
    category: args.seed.category,
    isDefault: args.seed.isDefault ?? false,
    isTerminal: args.seed.isTerminal ?? args.seed.category === "terminal",
    isRemovable: args.seed.isRemovable ?? true,
    sourceTemplateId: args.sourceTemplateId,
    recordState: "active",
    createdByUserId: args.actorUserId,
    createdAt: args.now,
    updatedAt: args.now,
  });

  return { id, created: true };
}

export async function ensureSavedView(
  ctx: MutationCtx,
  args: {
    organizationId: string;
    actorUserId: string;
    seed: SavedViewSeed;
    now: number;
  },
) {
  const existing = await ctx.db
    .query("savedViews")
    .withIndex("by_resource_scope_state", (q) =>
      q
        .eq("organizationId", args.organizationId)
        .eq("resourceType", args.seed.resourceType)
        .eq("scopeType", args.seed.scopeType)
        .eq("scopeId", args.seed.scopeId)
        .eq("recordState", "active"),
    )
    .collect();

  const matching = existing.find((view) => view.sourceTemplateId === args.seed.sourceTemplateId);
  if (matching) return { id: matching._id, created: false };

  const id = await ctx.db.insert("savedViews", {
    organizationId: args.organizationId,
    resourceType: args.seed.resourceType,
    viewType: args.seed.viewType,
    name: args.seed.name,
    description: args.seed.description,
    scopeType: args.seed.scopeType,
    scopeId: args.seed.scopeId,
    visibility: args.seed.visibility ?? "organization",
    config: args.seed.config,
    isDefault: args.seed.isDefault,
    sourceTemplateId: args.seed.sourceTemplateId,
    isSystemDefault: true,
    isRemovable: false,
    recordState: "active",
    createdByUserId: args.actorUserId,
    createdAt: args.now,
    updatedAt: args.now,
  });

  return { id, created: true };
}

export async function ensureSurface(
  ctx: MutationCtx,
  args: {
    organizationId: string;
    actorUserId: string;
    seed: SurfaceSeed;
    now: number;
  },
) {
  const existing = await ctx.db
    .query("surfaces")
    .withIndex("by_organization_key", (q) => q.eq("organizationId", args.organizationId).eq("key", args.seed.key))
    .first();

  if (existing) return { id: existing._id, created: false };

  const id = await ctx.db.insert("surfaces", {
    organizationId: args.organizationId,
    scopeType: args.seed.scopeType,
    scopeId: args.seed.scopeId,
    key: args.seed.key,
    title: args.seed.title,
    visibility: args.seed.visibility ?? "organization",
    recordState: "active",
    createdByUserId: args.actorUserId,
    createdAt: args.now,
    updatedAt: args.now,
  });

  return { id, created: true };
}

export async function ensureSurfaceTab(
  ctx: MutationCtx,
  args: {
    organizationId: string;
    surfaceId: Id<"surfaces">;
    actorUserId: string;
    seed: SurfaceTabSeed;
    savedViewId?: Id<"savedViews">;
    now: number;
  },
) {
  const existing = await ctx.db
    .query("surfaceTabs")
    .withIndex("by_surface_state_order", (q) =>
      q
        .eq("organizationId", args.organizationId)
        .eq("surfaceId", args.surfaceId)
        .eq("recordState", "active"),
    )
    .collect();

  const matching = existing.find((tab) => {
    if (args.seed.tabType !== tab.tabType) return false;
    if (args.seed.tabType === "savedView") return tab.savedViewId === args.savedViewId;
    if (args.seed.tabType === "system") return tab.systemKey === args.seed.systemKey;
    return tab.recordType === args.seed.recordType && tab.recordId === args.seed.recordId;
  });
  if (matching) return { id: matching._id, created: false };

  const id = await ctx.db.insert("surfaceTabs", {
    organizationId: args.organizationId,
    surfaceId: args.surfaceId,
    tabType: args.seed.tabType,
    label: args.seed.label,
    icon: args.seed.icon,
    order: args.seed.order,
    savedViewId: args.savedViewId,
    systemKey: args.seed.systemKey,
    recordType: args.seed.recordType,
    recordId: args.seed.recordId,
    visibility: args.seed.visibility ?? "organization",
    recordState: "active",
    createdByUserId: args.actorUserId,
    createdAt: args.now,
    updatedAt: args.now,
  });

  return { id, created: true };
}

export async function listActiveSurfaceTabs(ctx: DbCtx, organizationId: string, surfaceId: Id<"surfaces">) {
  return await ctx.db
    .query("surfaceTabs")
    .withIndex("by_surface_state_order", (q) =>
      q.eq("organizationId", organizationId).eq("surfaceId", surfaceId).eq("recordState", "active"),
    )
    .collect();
}
