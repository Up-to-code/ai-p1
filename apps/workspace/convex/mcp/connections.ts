import { v } from "convex/values";
import { internalMutation, mutation, query } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { components } from "../_generated/api";
import { apiKeys } from "../apiKeys";
import { authComponent } from "../auth";
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

const MAX_TOOL_CALLS_PER_MINUTE = 120;
const MAX_CONNECTION_LIST_ITEMS = 500;
const MINUTE_MS = 60 * 1000;

type BetterAuthMember = {
  organizationId: string;
  userId: string;
  role: string;
};

type BetterAuthOrganizationRole = {
  organizationId: string;
  role: string;
  permission: string;
};

const defaultMcpRolePermissions = {
  owner: {
    organization: ["read", "update", "delete"],
    client: ["create", "read", "update", "delete"],
    task: ["create", "read", "update", "delete"],
    project: ["create", "read", "update", "delete"],
    property: ["create", "read", "update", "delete"],
    calendar: ["create", "read", "update", "delete"],
    media: ["create", "read", "update", "delete"],
  },
  admin: {
    organization: ["read"],
    client: ["create", "read", "update", "delete"],
    task: ["create", "read", "update", "delete"],
    project: ["create", "read", "update", "delete"],
    property: ["create", "read", "update", "delete"],
    calendar: ["create", "read", "update", "delete"],
    media: ["create", "read", "update", "delete"],
  },
  member: {
    organization: ["read"],
    client: ["read"],
    task: ["read"],
    project: ["read"],
    property: ["read"],
    calendar: ["read"],
    media: ["read"],
  },
} satisfies Record<"owner" | "admin" | "member", Partial<Record<McpResource, McpAction[]>>>;
const mcpRolePermissions: Record<string, Partial<Record<McpResource, McpAction[]>>> = defaultMcpRolePermissions;

function presentConnection(connection: Doc<"organizationMcpConnections">) {
  return {
    _id: connection._id,
    _creationTime: connection._creationTime,
    id: connection._id,
    organizationId: connection.organizationId,
    publicId: connection.publicId,
    keyId: connection.keyId,
    keyLast4: connection.keyLast4,
    name: connection.name,
    instructions: connection.instructions,
    permissions: connection.permissions,
    status: connection.status,
    createdByUserId: connection.createdByUserId,
    createdAt: connection.createdAt,
    updatedAt: connection.updatedAt,
    lastUsedAt: connection.lastUsedAt,
    expiresAt: connection.expiresAt,
    usageCount: connection.usageCount,
    revokedAt: connection.revokedAt,
  };
}

function permissionRecord(permissions: McpPermission[]) {
  return Object.fromEntries(
    permissions.map((permission) => [permission.resource, permission.actions]),
  );
}

function hasPermission(
  permissions: McpPermission[],
  resource: McpResource,
  action: McpAction,
) {
  return permissions.some((permission) =>
    permission.resource === resource && permission.actions.includes(action),
  );
}

function roleList(role: string) {
  return role.split(",").map((item) => item.trim()).filter(Boolean);
}

function parseCustomPermission(value: string) {
  try {
    const parsed = JSON.parse(value) as Partial<Record<McpResource, McpAction[]>>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function findOrganizationMember(
  ctx: Parameters<typeof assertOrganizationResourcePermission>[0],
  organizationId: string,
  userId: string,
) {
  return await ctx.runQuery(components.betterAuth.adapter.findOne, {
    model: "member",
    where: [
      { field: "organizationId", value: organizationId },
      { field: "userId", value: userId },
    ],
  }) as BetterAuthMember | null;
}

async function listOrganizationRoles(
  ctx: Parameters<typeof assertOrganizationResourcePermission>[0],
  organizationId: string,
) {
  return await ctx.runQuery(components.betterAuth.adapter.findMany, {
    model: "organizationRole",
    paginationOpts: { cursor: null, numItems: 100 },
    where: [{ field: "organizationId", value: organizationId }],
  }) as BetterAuthOrganizationRole[];
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
    customRoles.map((role) => [role.role, parseCustomPermission(role.permission)]),
  );

  return roleList(member.role).some((roleName) => {
    const defaultPermission = mcpRolePermissions[roleName];
    const customPermission = customPermissionByRole.get(roleName);
    const actions = defaultPermission?.[resource] ?? customPermission?.[resource] ?? [];
    return actions.includes(action);
  });
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

async function assertDelegatedPermissions(
  ctx: Parameters<typeof assertOrganizationResourcePermission>[0],
  organizationId: string,
  permissions: McpPermission[],
) {
  for (const permission of permissions) {
    for (const action of permission.actions) {
      await assertOrganizationResourcePermission(ctx, organizationId, permission.resource, action);
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
  const user = await authComponent.getAuthUser(ctx);
  if (connection.createdByUserId === user._id) return user;
  if (await canManageMcpConnections(ctx, organizationId)) return user;
  throw new Error("Agent link was not found.");
}

export const list = query({
  args: { organizationId: v.string() },
  returns: v.array(mcpConnectionValidator),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    await assertOrganizationMember(ctx, args.organizationId);
    const canManage = await canManageMcpConnections(ctx, args.organizationId);
    const connections = await ctx.db
      .query("organizationMcpConnections")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .take(MAX_CONNECTION_LIST_ITEMS);

    return connections
      .filter((connection) => canManage || connection.createdByUserId === user._id)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map(presentConnection);
  },
});

export const createFromHono = mutation({
  args: { organizationId: v.string(), input: createMcpConnectionInputValidator },
  returns: v.object({ connection: mcpConnectionValidator, secret: v.string() }),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    await assertOrganizationMember(ctx, args.organizationId);
    await assertDelegatedPermissions(ctx, args.organizationId, args.input.permissions);
    const now = Date.now();
    const key = await apiKeys.create(ctx, {
      name: args.input.name,
      namespace: `organization:${args.organizationId}`,
      permissions: permissionRecord(args.input.permissions),
      metadata: { kind: "mcpConnection", organizationId: args.organizationId },
      ttlMs: args.input.expiresAt ? Math.max(args.input.expiresAt - now, 0) : null,
    });

    const connectionId = await ctx.db.insert("organizationMcpConnections", {
      organizationId: args.organizationId,
      publicId: `pending-${key.keyId}`,
      keyId: key.keyId,
      keyLast4: key.tokenLast4,
      name: args.input.name,
      instructions: args.input.instructions,
      permissions: args.input.permissions,
      status: "active",
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
      expiresAt: key.expiresAt,
      usageCount: 0,
    });
    await ctx.db.patch(connectionId, { publicId: connectionId });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      actorType: "user",
      action: "mcpConnection.create",
      target: connectionId,
      summary: `Created agent link ${args.input.name}.`,
      createdAt: now,
    });

    const connection = await ctx.db.get(connectionId);
    if (!connection) throw new Error("Agent link could not be created.");

    return { connection: presentConnection(connection), secret: key.token };
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
    if (args.input.permissions) {
      await assertDelegatedPermissions(ctx, args.organizationId, args.input.permissions);
    }
    const patch = {
      ...(args.input.name ? { name: args.input.name } : {}),
      ...(args.input.instructions !== undefined ? { instructions: args.input.instructions } : {}),
      ...(args.input.permissions ? { permissions: args.input.permissions } : {}),
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
    return presentConnection(connection);
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
      metadata: { organizationId: args.organizationId, connectionId: args.connectionId },
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
    return { connection: presentConnection(connection), secret: rotated.token };
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
    const livePermissions = await filterLivePermissions(ctx, connection.organizationId, connection.createdByUserId, connection.permissions);
    if (args.resource && args.action && !hasPermission(livePermissions, args.resource, args.action)) {
      return { ok: false, reason: "permission_denied" };
    }

    return {
      ok: true,
      organizationId: connection.organizationId,
      connectionId: connection._id,
      keyId: connection.keyId,
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
