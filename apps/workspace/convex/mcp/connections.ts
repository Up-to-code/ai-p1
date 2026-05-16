import { v } from "convex/values";
import { internalMutation, mutation, query } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
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

async function assertApiKeyPermission(
  ctx: Parameters<typeof assertOrganizationResourcePermission>[0],
  organizationId: string,
  action: "create" | "read" | "update" | "delete",
) {
  await assertOrganizationResourcePermission(ctx, organizationId, "apiKey", action);
}

export const list = query({
  args: { organizationId: v.string() },
  returns: v.array(mcpConnectionValidator),
  handler: async (ctx, args) => {
    await assertApiKeyPermission(ctx, args.organizationId, "read");
    const connections = await ctx.db
      .query("organizationMcpConnections")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .take(MAX_CONNECTION_LIST_ITEMS);

    return connections
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map(presentConnection);
  },
});

export const createFromHono = mutation({
  args: { organizationId: v.string(), input: createMcpConnectionInputValidator },
  returns: v.object({ connection: mcpConnectionValidator, secret: v.string() }),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    await assertApiKeyPermission(ctx, args.organizationId, "create");
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
    const user = await authComponent.getAuthUser(ctx);
    await assertApiKeyPermission(ctx, args.organizationId, "update");
    const existing = await ctx.db.get(args.connectionId);
    if (!existing || existing.organizationId !== args.organizationId || existing.status === "revoked") {
      throw new Error("Agent link was not found.");
    }

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
    const user = await authComponent.getAuthUser(ctx);
    await assertApiKeyPermission(ctx, args.organizationId, "delete");
    const existing = await ctx.db.get(args.connectionId);
    if (!existing || existing.organizationId !== args.organizationId) {
      throw new Error("Agent link was not found.");
    }

    const now = Date.now();
    await apiKeys.invalidate(ctx, {
      keyId: existing.keyId,
      reason: "revoked from organization settings",
      metadata: { organizationId: args.organizationId, connectionId: args.connectionId },
    });
    await ctx.db.patch(args.connectionId, {
      status: "revoked",
      revokedAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      actorType: "user",
      action: "mcpConnection.revoke",
      target: args.connectionId,
      summary: `Revoked agent link ${existing.name}.`,
      createdAt: now,
    });

    return { revoked: true };
  },
});

export const rotateFromHono = mutation({
  args: { organizationId: v.string(), connectionId: v.id("organizationMcpConnections") },
  returns: v.object({ connection: mcpConnectionValidator, secret: v.string() }),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    await assertApiKeyPermission(ctx, args.organizationId, "create");
    const existing = await ctx.db.get(args.connectionId);
    if (!existing || existing.organizationId !== args.organizationId || existing.status === "revoked") {
      throw new Error("Agent link was not found.");
    }

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
    if (args.resource && args.action && !hasPermission(connection.permissions, args.resource, args.action)) {
      return { ok: false, reason: "permission_denied" };
    }

    return {
      ok: true,
      organizationId: connection.organizationId,
      connectionId: connection._id,
      keyId: connection.keyId,
      name: connection.name,
      instructions: connection.instructions,
      permissions: connection.permissions,
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
