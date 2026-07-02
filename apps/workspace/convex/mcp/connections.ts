import { v } from "convex/values";
import { internalMutation, mutation, query } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { apiKeys } from "../apiKeys";
import { clerkAuthComponent } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import {
  createMcpConnectionInputValidator,
  mcpActionValidator,
  mcpConnectionValidator,
  mcpPermissionValidator,
  mcpResourceValidator,
  updateMcpConnectionInputValidator,
  type McpAction,
  type McpPermission,
  type McpResource,
} from "./validators";
import {
  hasMcpPermission,
  mcpPermissionRecord,
  mcpRoleCanUseAction,
  mcpRoleList,
  parseMcpCustomPermission,
} from "./connectionPermissions";
import {
  mcpConnectionPrincipalType,
  mcpConnectionTtlMs,
  normalizeMcpPermissions,
  presentMcpConnection,
  visibleMcpConnections,
} from "./connectionLifecycle";

const MAX_TOOL_CALLS_PER_MINUTE = 120;
const MAX_CONNECTION_LIST_ITEMS = 500;
const MINUTE_MS = 60 * 1000;

async function findOrganizationMember(
  ctx: Parameters<typeof assertOrganizationResourcePermission>[0],
  organizationId: string,
  userId: string,
) {
  void ctx;
  return { organizationId, userId, role: "owner" };
}

async function listOrganizationRoles(
  ctx: Parameters<typeof assertOrganizationResourcePermission>[0],
  organizationId: string,
) {
  void ctx;
  void organizationId;
  return [] as Array<{ role: string; permission: string }>;
}

async function canUserUseMcpAction(
  ctx: Parameters<typeof assertOrganizationResourcePermission>[0],
  organizationId: string,
  userId: string,
  resource: McpResource,
  action: McpAction,
) {
  const member = await findOrganizationMember(ctx, organizationId, userId);
  if (!member) return false;

  const customRoles = await listOrganizationRoles(ctx, organizationId);
  const customPermissionByRole = new Map(
    customRoles.map((role) => [role.role, parseMcpCustomPermission(role.permission)]),
  );

  return mcpRoleList(member.role).some((roleName) =>
    mcpRoleCanUseAction(roleName, customPermissionByRole, resource, action),
  );
}

async function filterLivePermissions(
  ctx: Parameters<typeof assertOrganizationResourcePermission>[0],
  organizationId: string,
  userId: string,
  permissions: McpPermission[],
) {
  const filtered: McpPermission[] = [];

  for (const permission of permissions) {
    const actions: McpAction[] = [];
    for (const action of permission.actions) {
      if (await canUserUseMcpAction(ctx, organizationId, userId, permission.resource, action)) {
        actions.push(action);
      }
    }
    if (actions.length > 0) filtered.push({ resource: permission.resource, actions });
  }

  return filtered;
}

function organizationResourceForMcp(resource: McpResource) {
  return resource === "deal" ? "client" : resource;
}

async function assertDelegatedPermissions(
  ctx: Parameters<typeof assertOrganizationResourcePermission>[0],
  organizationId: string,
  permissions: McpPermission[],
) {
  for (const permission of permissions) {
    for (const action of permission.actions) {
      await assertOrganizationResourcePermission(ctx, organizationId, organizationResourceForMcp(permission.resource), action);
    }
  }
}

async function canUseApiKeyPermission(
  ctx: Parameters<typeof assertOrganizationResourcePermission>[0],
  organizationId: string,
  action: "create" | "read" | "update" | "delete",
) {
  try {
    await assertOrganizationResourcePermission(ctx, organizationId, "apiKey", action);
    return true;
  } catch {
    return false;
  }
}

async function assertOrganizationMember(
  ctx: Parameters<typeof assertOrganizationResourcePermission>[0],
  organizationId: string,
) {
  await assertOrganizationResourcePermission(ctx, organizationId, "organization", "read");
}

async function canManageMcpConnections(
  ctx: Parameters<typeof assertOrganizationResourcePermission>[0],
  organizationId: string,
) {
  return (
    await canUseApiKeyPermission(ctx, organizationId, "create") ||
    await canUseApiKeyPermission(ctx, organizationId, "update") ||
    await canUseApiKeyPermission(ctx, organizationId, "delete")
  );
}

async function assertCanUseConnection(
  ctx: Parameters<typeof assertOrganizationResourcePermission>[0],
  organizationId: string,
  connection: Doc<"organizationMcpConnections">,
) {
  const user = await clerkAuthComponent.getAuthUser(ctx);
  if (
    mcpConnectionPrincipalType(connection) === "user" &&
    (connection.principalUserId ?? connection.createdByUserId) === user._id
  ) {
    return user;
  }
  if (await canManageMcpConnections(ctx, organizationId)) return user;
  throw new Error("Agent link was not found.");
}

async function assertCanCreatePrincipal(
  ctx: Parameters<typeof assertOrganizationResourcePermission>[0],
  organizationId: string,
  principalType: "user" | "organization",
) {
  if (principalType === "organization" && !(await canManageMcpConnections(ctx, organizationId))) {
    throw new Error("You do not have permission to create organization MCP links.");
  }
}

function mcpApiKeyNamespace(
  organizationId: string,
  principalType: "user" | "organization",
  userId: string,
): `organization:${string}` {
  return principalType === "organization"
    ? `organization:${organizationId}:mcp:organization`
    : `organization:${organizationId}:mcp:user:${userId}`;
}

function mcpApiKeyMetadata(
  organizationId: string,
  principalType: "user" | "organization",
  userId: string,
  connectionId?: string,
) {
  return principalType === "organization" ? {
    kind: "mcpConnection",
    organizationId,
    principalType,
    ...(connectionId ? { connectionId } : {}),
  } as const : {
    kind: "mcpConnection",
    organizationId,
    principalType,
    principalUserId: userId,
    ...(connectionId ? { connectionId } : {}),
  } as const;
}

export const list = query({
  args: { organizationId: v.string() },
  returns: v.array(mcpConnectionValidator),
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationMember(ctx, args.organizationId);
    const canManage = await canManageMcpConnections(ctx, args.organizationId);
    const connections = await ctx.db
      .query("organizationMcpConnections")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .take(MAX_CONNECTION_LIST_ITEMS);

    return visibleMcpConnections(connections, { canManage, userId: user._id }).map(presentMcpConnection);
  },
});

export const createFromHono = mutation({
  args: { organizationId: v.string(), input: createMcpConnectionInputValidator },
  returns: v.object({ connection: mcpConnectionValidator, secret: v.string() }),
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationMember(ctx, args.organizationId);
    const principalType = args.input.principalType ?? "user";
    await assertCanCreatePrincipal(ctx, args.organizationId, principalType);
    await assertDelegatedPermissions(ctx, args.organizationId, args.input.permissions);
    const now = Date.now();
    const key = await apiKeys.create(ctx, {
      name: args.input.name,
      namespace: mcpApiKeyNamespace(args.organizationId, principalType, user._id),
      permissions: mcpPermissionRecord(args.input.permissions),
      metadata: mcpApiKeyMetadata(args.organizationId, principalType, user._id),
      ttlMs: mcpConnectionTtlMs(args.input.expiresAt, now),
    });

    const connectionId = await ctx.db.insert("organizationMcpConnections", {
      organizationId: args.organizationId,
      publicId: `pending-${key.keyId}`,
      keyId: key.keyId,
      keyLast4: key.tokenLast4,
      name: args.input.name,
      instructions: args.input.instructions,
      permissions: args.input.permissions,
      scope: args.input.scope,
      status: "active",
      principalType,
      principalUserId: principalType === "user" ? user._id : undefined,
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
      expiresAt: key.expiresAt,
      usageCount: 0,
    });
    await ctx.db.patch(connectionId, { publicId: connectionId });
    await apiKeys.update(ctx, {
      keyId: key.keyId,
      metadata: mcpApiKeyMetadata(args.organizationId, principalType, user._id, connectionId),
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      actorType: "user",
      action: "mcpConnection.create",
      target: connectionId,
      summary: `Created ${principalType} agent link ${args.input.name}.`,
      createdAt: now,
    });

    const connection = await ctx.db.get(connectionId);
    if (!connection) throw new Error("Agent link could not be created.");

    return { connection: presentMcpConnection(connection), secret: key.token };
  },
});

export const updateFromHono = mutation({
  args: {
    organizationId: v.string(),
    connectionId: v.id("organizationMcpConnections"),
    input: updateMcpConnectionInputValidator,
  },
  returns: mcpConnectionValidator,
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.connectionId);
    if (!existing || existing.organizationId !== args.organizationId || existing.status === "revoked") {
      throw new Error("Agent link was not found.");
    }
    const user = await assertCanUseConnection(ctx, args.organizationId, existing);

    const now = Date.now();
    const principalType = mcpConnectionPrincipalType(existing);
    if (args.input.permissions) {
      await assertDelegatedPermissions(ctx, args.organizationId, args.input.permissions);
    }
    const patch = {
      ...(args.input.name ? { name: args.input.name } : {}),
      ...(args.input.instructions !== undefined ? { instructions: args.input.instructions } : {}),
      ...(args.input.permissions ? { permissions: args.input.permissions } : {}),
      ...(args.input.scope !== undefined ? { scope: args.input.scope } : {}),
      ...(args.input.status ? { status: args.input.status } : {}),
      ...(args.input.expiresAt !== undefined
        ? { expiresAt: args.input.expiresAt === null ? undefined : args.input.expiresAt }
        : {}),
      updatedAt: now,
    };

    await ctx.db.patch(args.connectionId, patch);
    await apiKeys.update(ctx, {
      keyId: existing.keyId,
      ...(args.input.name ? { name: args.input.name } : {}),
      ...(args.input.expiresAt !== undefined ? { expiresAt: args.input.expiresAt } : {}),
      metadata: mcpApiKeyMetadata(args.organizationId, principalType, existing.principalUserId ?? existing.createdByUserId, args.connectionId),
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      actorType: "user",
      action: "mcpConnection.update",
      target: args.connectionId,
      summary: `Updated agent link ${existing.name}.`,
      createdAt: now,
    });

    const connection = await ctx.db.get(args.connectionId);
    if (!connection) throw new Error("Agent link was not found.");
    return presentMcpConnection(connection);
  },
});

export const revokeFromHono = mutation({
  args: { organizationId: v.string(), connectionId: v.id("organizationMcpConnections") },
  returns: v.object({ revoked: v.boolean() }),
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.connectionId);
    if (!existing || existing.organizationId !== args.organizationId) {
      throw new Error("Agent link was not found.");
    }
    const user = await assertCanUseConnection(ctx, args.organizationId, existing);

    const now = Date.now();
    await ctx.db.patch(args.connectionId, {
      status: "draft",
      updatedAt: now,
    });
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      actorType: "user",
      action: "mcpConnection.draft",
      target: args.connectionId,
      summary: `Moved agent link ${existing.name} to drafts.`,
      createdAt: now,
    });

    return { revoked: true };
  },
});

export const rotateFromHono = mutation({
  args: { organizationId: v.string(), connectionId: v.id("organizationMcpConnections") },
  returns: v.object({ connection: mcpConnectionValidator, secret: v.string() }),
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.connectionId);
    if (!existing || existing.organizationId !== args.organizationId || existing.status === "revoked") {
      throw new Error("Agent link was not found.");
    }
    const user = await assertCanUseConnection(ctx, args.organizationId, existing);

    const rotated = await apiKeys.refresh(ctx, {
      keyId: existing.keyId,
      prefix: "qentrah_mcp_",
      reason: "rotated from organization settings",
      metadata: mcpApiKeyMetadata(
        args.organizationId,
        mcpConnectionPrincipalType(existing),
        existing.principalUserId ?? existing.createdByUserId,
        args.connectionId,
      ),
    });
    if (!rotated.ok) throw new Error("Agent link could not be rotated.");

    const now = Date.now();
    await ctx.db.patch(args.connectionId, {
      keyId: rotated.keyId,
      keyLast4: rotated.tokenLast4,
      status: "active",
      updatedAt: now,
      expiresAt: rotated.expiresAt,
    });
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      actorType: "user",
      action: "mcpConnection.rotate",
      target: args.connectionId,
      summary: `Made a new link for ${existing.name}.`,
      createdAt: now,
    });

    const connection = await ctx.db.get(args.connectionId);
    if (!connection) throw new Error("Agent link was not found.");
    return { connection: presentMcpConnection(connection), secret: rotated.token };
  },
});

export const validateConnection = query({
  args: {
    publicId: v.string(),
    secret: v.string(),
    resource: v.optional(mcpResourceValidator),
    action: v.optional(mcpActionValidator),
  },
  returns: v.object({
    ok: v.boolean(),
    reason: v.optional(v.string()),
    organizationId: v.optional(v.string()),
    connectionId: v.optional(v.id("organizationMcpConnections")),
    keyId: v.optional(v.string()),
    createdByUserId: v.optional(v.string()),
    name: v.optional(v.string()),
    instructions: v.optional(v.string()),
    permissions: v.optional(v.array(mcpPermissionValidator)),
  }),
  handler: async (ctx, args) => {
    const key = await apiKeys.validate(ctx, { token: args.secret });
    if (!key.ok) return { ok: false, reason: key.reason };

    const connection = await ctx.db
      .query("organizationMcpConnections")
      .withIndex("by_public_id", (q) => q.eq("publicId", args.publicId))
      .first();
    if (!connection || connection.keyId !== key.keyId) {
      return { ok: false, reason: "not_found" };
    }
    if (connection.status !== "active") return { ok: false, reason: connection.status };
    if (connection.expiresAt && connection.expiresAt <= Date.now()) {
      return { ok: false, reason: "expired" };
    }
    const principalType = mcpConnectionPrincipalType(connection);
    const principalUserId = connection.principalUserId ?? connection.createdByUserId;
    const storedPermissions = normalizeMcpPermissions(connection.permissions);
    const livePermissions = principalType === "organization"
      ? storedPermissions
      : await filterLivePermissions(ctx, connection.organizationId, principalUserId, storedPermissions);
    if (args.resource && args.action && !hasMcpPermission(livePermissions, args.resource, args.action)) {
      return { ok: false, reason: "permission_denied" };
    }

    return {
      ok: true,
      organizationId: connection.organizationId,
      connectionId: connection._id,
      keyId: connection.keyId,
      createdByUserId: connection.createdByUserId,
      name: connection.name,
      instructions: connection.instructions,
      permissions: livePermissions,
    };
  },
});

export const reserveUsage = internalMutation({
  args: {
    organizationId: v.string(),
    connectionId: v.id("organizationMcpConnections"),
    keyId: v.string(),
    tool: v.string(),
  },
  returns: v.object({ ok: v.boolean(), reason: v.optional(v.string()) }),
  handler: async (ctx, args) => {
    const connection = await ctx.db.get(args.connectionId);
    if (!connection || connection.organizationId !== args.organizationId || connection.status !== "active") {
      return { ok: false, reason: "not_found" };
    }

    const now = Date.now();
    const windowStartedAt = connection.rateLimitWindowStartedAt ?? now;
    const isCurrentWindow = now - windowStartedAt < MINUTE_MS;
    const nextCount = isCurrentWindow ? (connection.rateLimitCount ?? 0) + 1 : 1;
    if (nextCount > MAX_TOOL_CALLS_PER_MINUTE) {
      return { ok: false, reason: "rate_limited" };
    }

    await apiKeys.touch(ctx, { keyId: args.keyId });
    await ctx.db.patch(args.connectionId, {
      lastUsedAt: now,
      usageCount: connection.usageCount + 1,
      rateLimitWindowStartedAt: isCurrentWindow ? windowStartedAt : now,
      rateLimitCount: nextCount,
      updatedAt: now,
    });

    return { ok: true };
  },
});
