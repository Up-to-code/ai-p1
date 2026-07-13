import { ConvexError } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import {
  canAccessProject,
  canAccessSpace,
  canPerformOrganizationAction,
  canPerformProjectAction,
  canPerformSpaceAction,
  hasOrganizationMembership,
} from "../permissions";
import type { McpAction, McpResource, McpScope } from "./validators";

const MAX_SCOPE_LINKS = 5_000;

type ScopeCtx = Pick<QueryCtx, "auth" | "db" | "runQuery">;
type ScopedTargetTable = "projects" | "spaces" | "clients" | "deals" | "tasks" | "calendarEvents";
type StoredMcpScope = {
  type: "organization" | "space" | "project";
  spaceIds?: Id<"spaces">[];
  projectIds?: Id<"projects">[];
};

export type EffectiveScopePolicy = Readonly<{
  organizationId: string;
  actorUserId: string;
  scope: McpScope;
  spaceIds: Id<"spaces">[];
  projectIds: Id<"projects">[];
  clientIds: Id<"clients">[];
}>;

export type ScopePolicyContext = {
  organizationId: string;
  actorUserId: string;
  scopeType: McpScope["type"];
  spaceIds: string[];
  projectIds: string[];
  clientIds: string[];
};

export type ScopePolicyErrorCode =
  | "MCP_SCOPE_REQUIRED"
  | "MCP_SCOPE_INVALID"
  | "MCP_SCOPE_ACCESS_REVOKED"
  | "MCP_SCOPE_DENIED";

function scopeError(code: ScopePolicyErrorCode, message: string): never {
  throw new ConvexError({ code, message });
}

function unique<T extends string>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

export function normalizeMcpScope(
  scope: StoredMcpScope | undefined,
): McpScope {
  if (!scope) {
    return { type: "organization" };
  }
  if (scope.type === "organization") {
    if ((scope.spaceIds?.length ?? 0) > 0 || (scope.projectIds?.length ?? 0) > 0) {
      return scopeError("MCP_SCOPE_INVALID", "Organization scope cannot include Space or Project IDs.");
    }
    return { type: "organization" };
  }
  if (scope.type === "space") {
    if (!scope.spaceIds?.length || (scope.projectIds?.length ?? 0) > 0) {
      return scopeError("MCP_SCOPE_INVALID", "Space scope requires only a non-empty Space selection.");
    }
    return { type: "space", spaceIds: unique(scope.spaceIds) };
  }
  if (!scope.projectIds?.length || (scope.spaceIds?.length ?? 0) > 0) {
    return scopeError("MCP_SCOPE_INVALID", "Project scope requires only a non-empty Project selection.");
  }
  return { type: "project", projectIds: unique(scope.projectIds) };
}

async function activeProjectMembership(
  ctx: ScopeCtx,
  organizationId: string,
  projectId: Id<"projects">,
  actorUserId: string,
) {
  const membership = await ctx.db
    .query("projectMembers")
    .withIndex("by_project_user", (q) =>
      q.eq("organizationId", organizationId).eq("projectId", projectId).eq("userId", actorUserId),
    )
    .first();
  return membership && !membership.deletedAt && membership.recordState !== "deleted"
    ? membership
    : null;
}

async function canReadSelectedProject(
  ctx: ScopeCtx,
  organizationId: string,
  projectId: Id<"projects">,
  actorUserId: string,
) {
  return (await canAccessProject(ctx, organizationId, projectId, actorUserId)) ||
    Boolean(await activeProjectMembership(ctx, organizationId, projectId, actorUserId));
}

async function canUseSelectedProjectAction(
  ctx: ScopeCtx,
  organizationId: string,
  projectId: Id<"projects">,
  actorUserId: string,
  action: McpAction,
) {
  if (action === "read") return canReadSelectedProject(ctx, organizationId, projectId, actorUserId);
  if (await canPerformProjectAction(ctx, organizationId, projectId, actorUserId, action)) return true;
  const membership = await activeProjectMembership(ctx, organizationId, projectId, actorUserId);
  if (!membership) return false;
  if (action === "update") return membership.role === "admin" || membership.role === "member";
  if (action === "delete") return membership.role === "admin";
  return false;
}

async function assertActiveSelectedSpaces(
  ctx: ScopeCtx,
  organizationId: string,
  actorUserId: string,
  spaceIds: readonly Id<"spaces">[],
) {
  for (const spaceId of spaceIds) {
    const space = await ctx.db.get(spaceId);
    if (
      !space ||
      space.organizationId !== organizationId ||
      space.deletedAt ||
      space.recordState === "deleted" ||
      !(await canAccessSpace(ctx, organizationId, spaceId, actorUserId))
    ) {
      scopeError("MCP_SCOPE_ACCESS_REVOKED", "The connection creator no longer has member access to a selected Space.");
    }
  }
}

async function assertActiveSelectedProjects(
  ctx: ScopeCtx,
  organizationId: string,
  actorUserId: string,
  projectIds: readonly Id<"projects">[],
) {
  for (const projectId of projectIds) {
    const project = await ctx.db.get(projectId);
    if (
      !project ||
      project.organizationId !== organizationId ||
      project.deletedAt ||
      project.recordState === "deleted" ||
      !(await canReadSelectedProject(ctx, organizationId, projectId, actorUserId))
    ) {
      scopeError("MCP_SCOPE_ACCESS_REVOKED", "The connection creator no longer has member access to a selected Project.");
    }
  }
}

export async function resolveScopePolicy(
  ctx: ScopeCtx,
  input: {
    organizationId: string;
    actorUserId: string;
    scope: StoredMcpScope | undefined;
  },
): Promise<EffectiveScopePolicy> {
  const scope = normalizeMcpScope(input.scope);
  if (!(await hasOrganizationMembership(ctx, input.organizationId, input.actorUserId))) {
    scopeError("MCP_SCOPE_ACCESS_REVOKED", "The connection creator is no longer an Organization member.");
  }

  if (scope.type === "space") {
    await assertActiveSelectedSpaces(ctx, input.organizationId, input.actorUserId, scope.spaceIds);
  } else if (scope.type === "project") {
    await assertActiveSelectedProjects(ctx, input.organizationId, input.actorUserId, scope.projectIds);
  }

  const projectSpaceLinks = scope.type === "organization"
    ? []
    : await ctx.db
        .query("projectSpaces")
        .withIndex("by_organization_id", (q) => q.eq("organizationId", input.organizationId))
        .take(MAX_SCOPE_LINKS);
  const activeLinks = projectSpaceLinks.filter(
    (link) => !link.deletedAt && link.recordState !== "deleted",
  );
  const spaceIds = scope.type === "organization"
    ? []
    : scope.type === "space"
      ? scope.spaceIds
      : unique(activeLinks.filter((link) => scope.projectIds.includes(link.projectId)).map((link) => link.spaceId));
  const projectIds = scope.type === "organization"
    ? []
    : scope.type === "project"
      ? scope.projectIds
      : unique(activeLinks.filter((link) => scope.spaceIds.includes(link.spaceId)).map((link) => link.projectId));

  const clients = new Set<Id<"clients">>();
  if (scope.type !== "organization") {
    for (const projectId of projectIds) {
      const project = await ctx.db.get(projectId);
      if (project?.organizationId === input.organizationId && project.clientId) clients.add(project.clientId);
    }
    const deals = await ctx.db
      .query("deals")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", input.organizationId))
      .take(MAX_SCOPE_LINKS);
    for (const deal of deals) {
      if (!deal.deletedAt && deal.projectId && projectIds.includes(deal.projectId) && deal.clientId) {
        clients.add(deal.clientId);
      }
    }
  }

  return {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    scope,
    spaceIds,
    projectIds,
    clientIds: [...clients],
  };
}

export async function canActorUseMcpPermission(
  ctx: ScopeCtx,
  policy: EffectiveScopePolicy,
  resource: McpResource,
  action: McpAction,
) {
  if (policy.scope.type === "organization" || resource === "organization") {
    return canPerformOrganizationAction(ctx, policy.organizationId, policy.actorUserId, resource, action);
  }
  if (resource === "client") {
    if (policy.clientIds.length === 0) return false;
    return canPerformOrganizationAction(ctx, policy.organizationId, policy.actorUserId, resource, action);
  }
  if (
    (resource === "deal" || resource === "task" || resource === "calendar" || resource === "media") &&
    !(await canPerformOrganizationAction(ctx, policy.organizationId, policy.actorUserId, resource, action))
  ) {
    return false;
  }
  if (resource === "deal" || resource === "task" || resource === "calendar" || resource === "media") {
    if (policy.projectIds.length === 0) return false;
    return (await Promise.all(policy.projectIds.map((id) =>
      canUseSelectedProjectAction(ctx, policy.organizationId, id, policy.actorUserId, action),
    ))).every(Boolean);
  }
  if (resource === "space") {
    if (policy.spaceIds.length === 0) return false;
    if (action === "read") {
      return (await Promise.all(policy.spaceIds.map((id) =>
        canAccessSpace(ctx, policy.organizationId, id, policy.actorUserId),
      ))).every(Boolean);
    }
    return (await Promise.all(policy.spaceIds.map((id) =>
      canPerformSpaceAction(ctx, policy.organizationId, id, policy.actorUserId, action),
    ))).every(Boolean);
  }
  if (resource === "project") {
    if (action === "create") {
      if (policy.scope.type === "project") return false;
      return (await Promise.all(policy.spaceIds.map((id) =>
        canPerformSpaceAction(ctx, policy.organizationId, id, policy.actorUserId, "create"),
      ))).every(Boolean);
    }
    if (policy.projectIds.length === 0) return false;
    return (await Promise.all(policy.projectIds.map((id) =>
      canUseSelectedProjectAction(ctx, policy.organizationId, id, policy.actorUserId, action),
    ))).every(Boolean);
  }
  return false;
}

function inNarrowScope(policy: EffectiveScopePolicy, value: { projectId?: unknown; spaceId?: unknown }) {
  const projectId = typeof value.projectId === "string" ? value.projectId : undefined;
  const spaceId = typeof value.spaceId === "string" ? value.spaceId : undefined;
  if (policy.scope.type === "project") {
    return Boolean(projectId && policy.projectIds.includes(projectId as Id<"projects">));
  }
  return Boolean(
    (projectId && policy.projectIds.includes(projectId as Id<"projects">)) ||
      (spaceId && policy.spaceIds.includes(spaceId as Id<"spaces">)),
  );
}

async function assertStoredTarget(
  ctx: ScopeCtx,
  policy: EffectiveScopePolicy,
  table: ScopedTargetTable,
  id: string,
) {
  const record = await ctx.db.get(id as never) as Record<string, unknown> | null;
  if (!record || record.organizationId !== policy.organizationId || record.deletedAt || record.recordState === "deleted") {
    scopeError("MCP_SCOPE_DENIED", "The requested record is outside this connection's scope.");
  }
  if (policy.scope.type === "organization") return;
  if (table === "projects" && policy.projectIds.includes(id as Id<"projects">)) return;
  if (table === "spaces" && policy.spaceIds.includes(id as Id<"spaces">)) return;
  if (table === "clients" && policy.clientIds.includes(id as Id<"clients">)) return;
  if (inNarrowScope(policy, record)) return;
  scopeError("MCP_SCOPE_DENIED", "The requested record is outside this connection's scope.");
}

export async function assertToolCallInScope(
  ctx: ScopeCtx,
  policy: EffectiveScopePolicy,
  tool: string,
  input: Record<string, unknown>,
) {
  if (policy.scope.type === "organization" || tool === "organization_info") return;

  const targets: Array<[string, ScopedTargetTable]> = [
    ["projectId", "projects"], ["spaceId", "spaces"], ["clientId", "clients"],
    ["dealId", "deals"], ["taskId", "tasks"], ["eventId", "calendarEvents"],
  ];
  for (const [key, table] of targets) {
    if (typeof input[key] === "string" && input[key]) {
      await assertStoredTarget(ctx, policy, table, input[key] as string);
    }
  }

  const changesScopeLink = Object.prototype.hasOwnProperty.call(input, "projectId") ||
    Object.prototype.hasOwnProperty.call(input, "spaceId");
  if (changesScopeLink && !inNarrowScope(policy, input)) {
    scopeError("MCP_SCOPE_DENIED", "The requested Space or Project is outside this connection's scope.");
  }

  if (tool.startsWith("media_")) {
    const resourceType = input.resourceType;
    const resourceId = input.resourceId;
    const table = resourceType === "project" ? "projects"
      : resourceType === "client" ? "clients"
        : resourceType === "task" ? "tasks"
          : resourceType === "calendarEvent" ? "calendarEvents" : undefined;
    if (!table || typeof resourceId !== "string") {
      scopeError("MCP_SCOPE_DENIED", "Narrow-scope media calls require an in-scope resource.");
    }
    await assertStoredTarget(ctx, policy, table, resourceId);
  }

  const isCreate = tool.endsWith("_create") || tool === "notifications_schedule";
  if (isCreate && !inNarrowScope(policy, input)) {
    scopeError("MCP_SCOPE_DENIED", "Narrow-scope creates require an explicit in-scope Space or Project.");
  }
  if (
    tool === "spaces_create" || tool === "clients_create" || tool.startsWith("notifications_") ||
    (tool === "projects_create" && policy.scope.type === "project")
  ) {
    scopeError("MCP_SCOPE_DENIED", "This tool can only run from an Organization-scoped connection.");
  }
}

export function scopePolicyContext(
  policy: EffectiveScopePolicy,
): ScopePolicyContext {
  return {
    organizationId: policy.organizationId,
    actorUserId: policy.actorUserId,
    scopeType: policy.scope.type,
    spaceIds: policy.spaceIds,
    projectIds: policy.projectIds,
    clientIds: policy.clientIds,
  };
}

export function scopeActorUserId(policy: ScopePolicyContext) {
  return policy.actorUserId;
}

export function isScopedProject(policy: ScopePolicyContext, projectId: unknown) {
  return policy.scopeType === "organization" ||
    (typeof projectId === "string" && policy.projectIds.includes(projectId));
}

export function isScopedSpace(policy: ScopePolicyContext, spaceId: unknown) {
  return policy.scopeType === "organization" ||
    (typeof spaceId === "string" && policy.spaceIds.includes(spaceId));
}

export function isScopedClient(policy: ScopePolicyContext, clientId: unknown) {
  return policy.scopeType === "organization" ||
    (typeof clientId === "string" && policy.clientIds.includes(clientId));
}

export function isScopedResourceLink(
  policy: ScopePolicyContext,
  value: { projectId?: unknown; spaceId?: unknown },
) {
  if (policy.scopeType === "organization") return true;
  if (policy.scopeType === "project") return isScopedProject(policy, value.projectId);
  return isScopedProject(policy, value.projectId) || isScopedSpace(policy, value.spaceId);
}

export function projectVisibilityForMcpCreate(
  scopeType: ScopePolicyContext["scopeType"],
  defaultVisibility: "private" | "space_members" | "organization" | undefined,
) {
  if (scopeType === "organization") return "organization" as const;
  return defaultVisibility === "private" || defaultVisibility === "space_members"
    ? defaultVisibility
    : "space_members" as const;
}
