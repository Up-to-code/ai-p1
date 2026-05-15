import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { apiKeys } from "./apiKeys";
import { authComponent } from "./auth";
import { assertOrganizationResourcePermission } from "./organizations/profile/access";

const API_KEY_PREFIX = "qentrah_org_";
const QUOTA_LIMIT = 1_000;
const QUOTA_WINDOW_MS = 60 * 60 * 1000;
const DEFAULT_LIMIT = 100;

const apiKeyResourceValidator = v.union(
  v.literal("organization"),
  v.literal("client"),
  v.literal("property"),
  v.literal("project"),
  v.literal("calendar"),
  v.literal("task"),
  v.literal("media"),
);

const apiKeyActionValidator = v.union(
  v.literal("read"),
  v.literal("create"),
  v.literal("update"),
  v.literal("delete"),
);

const apiKeyPermissionValidator = v.object({
  resource: apiKeyResourceValidator,
  actions: v.array(apiKeyActionValidator),
});

const apiKeySummaryValidator = v.object({
  _id: v.id("organizationApiKeys"),
  _creationTime: v.number(),
  id: v.string(),
  organizationId: v.string(),
  keyId: v.string(),
  keyLast4: v.string(),
  name: v.string(),
  permissions: v.array(apiKeyPermissionValidator),
  status: v.union(v.literal("active"), v.literal("revoked"), v.literal("expired")),
  createdByUserId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
  lastUsedAt: v.optional(v.number()),
  expiresAt: v.optional(v.number()),
  usageCount: v.number(),
  quotaWindowStartedAt: v.optional(v.number()),
  quotaLimit: v.number(),
  quotaWindowMs: v.number(),
  quotaUsed: v.number(),
  revokedAt: v.optional(v.number()),
});

type ApiKeyResource = "organization" | "client" | "property" | "project" | "calendar" | "task" | "media";
type ApiKeyAction = "read" | "create" | "update" | "delete";
type ApiKeyPermission = { resource: ApiKeyResource; actions: ApiKeyAction[] };
type Input = Record<string, unknown>;

function presentKey(key: Doc<"organizationApiKeys">) {
  const now = Date.now();
  return {
    _id: key._id,
    _creationTime: key._creationTime,
    id: key._id,
    organizationId: key.organizationId,
    keyId: key.keyId,
    keyLast4: key.keyLast4,
    name: key.name,
    permissions: key.permissions,
    status: key.status === "active" && key.expiresAt && key.expiresAt <= now ? "expired" as const : key.status,
    createdByUserId: key.createdByUserId,
    createdAt: key.createdAt,
    updatedAt: key.updatedAt,
    lastUsedAt: key.lastUsedAt,
    expiresAt: key.expiresAt,
    usageCount: key.usageCount,
    quotaWindowStartedAt: key.quotaWindowStartedAt,
    quotaLimit: QUOTA_LIMIT,
    quotaWindowMs: QUOTA_WINDOW_MS,
    quotaUsed: key.quotaUsed ?? 0,
    revokedAt: key.revokedAt,
  };
}

function permissionRecord(permissions: ApiKeyPermission[]) {
  return Object.fromEntries(
    permissions.map((permission) => [permission.resource, permission.actions]),
  );
}

function hasPermission(permissions: ApiKeyPermission[], resource: ApiKeyResource, action: ApiKeyAction) {
  return permissions.some((permission) =>
    permission.resource === resource && permission.actions.includes(action),
  );
}

function objectInput(value: unknown): Input {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Input : {};
}

function optionalString(input: Input, key: string) {
  const value = input[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function optionalNumber(input: Input, key: string) {
  const value = input[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function requiredString(input: Input, key: string, fallback = "") {
  return optionalString(input, key) ?? fallback;
}

function present<T extends { _id: string }>(doc: T) {
  return { ...doc, id: doc._id };
}

function limitFromInput(input: Input) {
  const value = optionalNumber(input, "limit") ?? DEFAULT_LIMIT;
  return Math.max(1, Math.min(500, Math.floor(value)));
}

function clientPatch(input: Input) {
  return {
    ...(optionalString(input, "name") ? { name: optionalString(input, "name")! } : {}),
    ...(optionalString(input, "type") ? { type: optionalString(input, "type") as "Buyer" | "Tenant" | "Investor" | "Broker" } : {}),
    ...(optionalString(input, "contact") ? { contact: optionalString(input, "contact")! } : {}),
    ...(optionalString(input, "phone") ? { phone: optionalString(input, "phone")! } : {}),
    ...(optionalNumber(input, "age") !== undefined ? { age: optionalNumber(input, "age")! } : {}),
    ...(optionalString(input, "nationality") ? { nationality: optionalString(input, "nationality")! } : {}),
    ...(optionalString(input, "generation") ? { generation: optionalString(input, "generation")! } : {}),
    ...(optionalString(input, "budget") ? { budget: optionalString(input, "budget")! } : {}),
    ...(optionalString(input, "propertyInterest") ? { propertyInterest: optionalString(input, "propertyInterest")! } : {}),
    ...(optionalString(input, "status") ? { status: optionalString(input, "status") as "active" | "inactive" } : {}),
    ...(optionalString(input, "pipelineStage") ? { pipelineStage: optionalString(input, "pipelineStage") as "new" | "qualified" | "viewing" | "negotiation" | "closed" } : {}),
    ...(optionalNumber(input, "pipelineOrder") !== undefined ? { pipelineOrder: optionalNumber(input, "pipelineOrder")! } : {}),
    ...(optionalString(input, "priority") ? { priority: optionalString(input, "priority") as "normal" | "high" | "urgent" } : {}),
    ...(optionalString(input, "nextAction") ? { nextAction: optionalString(input, "nextAction")! } : {}),
    ...(optionalString(input, "issue") ? { issue: optionalString(input, "issue")! } : {}),
  };
}

async function assertApiKeyManagementPermission(
  ctx: Parameters<typeof assertOrganizationResourcePermission>[0],
  organizationId: string,
  action: "create" | "read" | "update" | "delete",
) {
  await assertOrganizationResourcePermission(ctx, organizationId, "apiKey", action);
}

async function assertDelegatedPermissions(
  ctx: Parameters<typeof assertOrganizationResourcePermission>[0],
  organizationId: string,
  permissions: ApiKeyPermission[],
) {
  for (const permission of permissions) {
    for (const action of permission.actions) {
      await assertOrganizationResourcePermission(ctx, organizationId, permission.resource, action);
    }
  }
}

async function listTable(
  ctx: QueryCtx,
  organizationId: string,
  table: "clients" | "propertyUnits" | "projects" | "clientTasks" | "calendarEvents",
  input: Input,
) {
  const rows = await ctx.db
    .query(table)
    .withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId))
    .take(limitFromInput(input));

  return rows.filter((row: { deletedAt?: number }) => !row.deletedAt).map(present);
}

export const list = query({
  args: { organizationId: v.string() },
  returns: v.array(apiKeySummaryValidator),
  handler: async (ctx, args) => {
    await assertApiKeyManagementPermission(ctx, args.organizationId, "read");
    const keys = await ctx.db
      .query("organizationApiKeys")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .take(500);

    return keys.sort((a, b) => b.updatedAt - a.updatedAt).map(presentKey);
  },
});

export const createFromHono = mutation({
  args: {
    organizationId: v.string(),
    input: v.object({
      name: v.string(),
      permissions: v.array(apiKeyPermissionValidator),
      expiresAt: v.optional(v.number()),
    }),
  },
  returns: v.object({ key: apiKeySummaryValidator, secret: v.string() }),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    await assertApiKeyManagementPermission(ctx, args.organizationId, "create");
    await assertDelegatedPermissions(ctx, args.organizationId, args.input.permissions);

    const now = Date.now();
    const keyId = await ctx.db.insert("organizationApiKeys", {
      organizationId: args.organizationId,
      keyId: "pending",
      keyLast4: "----",
      name: args.input.name,
      permissions: args.input.permissions,
      status: "active",
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
      expiresAt: args.input.expiresAt,
      usageCount: 0,
      quotaWindowStartedAt: now,
      quotaUsed: 0,
    });

    const created = await apiKeys.create(ctx, {
      namespace: `organization:${args.organizationId}`,
      name: args.input.name,
      prefix: API_KEY_PREFIX,
      permissions: permissionRecord(args.input.permissions),
      metadata: { kind: "orgApiKey", organizationId: args.organizationId, apiKeyId: keyId },
      ttlMs: args.input.expiresAt ? Math.max(args.input.expiresAt - now, 0) : null,
      idleTimeoutMs: null,
    });

    await ctx.db.patch(keyId, {
      keyId: created.keyId,
      keyLast4: created.tokenLast4,
      expiresAt: created.expiresAt,
      updatedAt: now,
    });
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      actorType: "user",
      action: "apiKey.create",
      target: keyId,
      summary: `Created API key ${args.input.name}.`,
      createdAt: now,
    });

    const key = await ctx.db.get(keyId);
    if (!key) throw new Error("API key could not be created.");
    return { key: presentKey(key), secret: created.token };
  },
});

export const rotateFromHono = mutation({
  args: {
    organizationId: v.string(),
    apiKeyId: v.id("organizationApiKeys"),
    input: v.object({ expiresAt: v.optional(v.number()) }),
  },
  returns: v.object({ key: apiKeySummaryValidator, secret: v.string() }),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    await assertApiKeyManagementPermission(ctx, args.organizationId, "update");
    const existing = await ctx.db.get(args.apiKeyId);
    if (!existing || existing.organizationId !== args.organizationId || existing.status === "revoked") {
      throw new Error("API key was not found.");
    }

    const now = Date.now();
    const rotated = await apiKeys.refresh(ctx, {
      keyId: existing.keyId,
      prefix: API_KEY_PREFIX,
      reason: "rotated from organization settings",
      metadata: { organizationId: args.organizationId, apiKeyId: args.apiKeyId },
    });
    if (!rotated.ok) throw new Error("API key could not be rotated.");
    await apiKeys.update(ctx, {
      keyId: rotated.keyId,
      expiresAt: args.input.expiresAt ?? null,
      maxIdleMs: null,
    });

    await ctx.db.patch(args.apiKeyId, {
      keyId: rotated.keyId,
      keyLast4: rotated.tokenLast4,
      status: "active",
      expiresAt: args.input.expiresAt,
      quotaWindowStartedAt: now,
      quotaUsed: 0,
      updatedAt: now,
    });
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      actorType: "user",
      action: "apiKey.rotate",
      target: args.apiKeyId,
      summary: `Rotated API key ${existing.name}.`,
      createdAt: now,
    });

    const key = await ctx.db.get(args.apiKeyId);
    if (!key) throw new Error("API key was not found.");
    return { key: presentKey(key), secret: rotated.token };
  },
});

export const revokeFromHono = mutation({
  args: { organizationId: v.string(), apiKeyId: v.id("organizationApiKeys") },
  returns: v.object({ revoked: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    await assertApiKeyManagementPermission(ctx, args.organizationId, "delete");
    const existing = await ctx.db.get(args.apiKeyId);
    if (!existing || existing.organizationId !== args.organizationId) {
      throw new Error("API key was not found.");
    }

    const now = Date.now();
    await apiKeys.invalidate(ctx, {
      keyId: existing.keyId,
      reason: "revoked from organization settings",
      metadata: { organizationId: args.organizationId, apiKeyId: args.apiKeyId },
    });
    await ctx.db.patch(args.apiKeyId, { status: "revoked", revokedAt: now, updatedAt: now });
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      actorType: "user",
      action: "apiKey.revoke",
      target: args.apiKeyId,
      summary: `Revoked API key ${existing.name}.`,
      createdAt: now,
    });

    return { revoked: true };
  },
});

export const validateAndReserve = mutation({
  args: {
    organizationId: v.string(),
    secret: v.string(),
    resource: apiKeyResourceValidator,
    action: apiKeyActionValidator,
  },
  returns: v.object({
    ok: v.boolean(),
    reason: v.optional(v.string()),
    organizationId: v.optional(v.string()),
    apiKeyId: v.optional(v.id("organizationApiKeys")),
    keyId: v.optional(v.string()),
    name: v.optional(v.string()),
    permissions: v.optional(v.array(apiKeyPermissionValidator)),
  }),
  handler: async (ctx, args) => {
    const validated = await apiKeys.validate(ctx, { token: args.secret });
    if (!validated.ok) return { ok: false, reason: validated.reason };
    if (validated.metadata?.kind !== "orgApiKey" || validated.metadata.organizationId !== args.organizationId) {
      return { ok: false, reason: "organization_mismatch" };
    }

    const apiKeyId = validated.metadata.apiKeyId as Id<"organizationApiKeys">;
    const key = await ctx.db.get(apiKeyId);
    if (!key || key.organizationId !== args.organizationId || key.keyId !== validated.keyId) {
      return { ok: false, reason: "not_found" };
    }
    if (key.status !== "active") return { ok: false, reason: key.status };
    if (key.expiresAt && key.expiresAt <= Date.now()) return { ok: false, reason: "expired" };
    if (!hasPermission(key.permissions, args.resource, args.action)) {
      return { ok: false, reason: "permission_denied" };
    }

    const now = Date.now();
    const windowStartedAt = key.quotaWindowStartedAt ?? now;
    const isCurrentWindow = now - windowStartedAt < QUOTA_WINDOW_MS;
    const nextQuotaUsed = isCurrentWindow ? (key.quotaUsed ?? 0) + 1 : 1;
    if (nextQuotaUsed > QUOTA_LIMIT) return { ok: false, reason: "rate_limited" };

    await apiKeys.touch(ctx, { keyId: key.keyId });
    await ctx.db.patch(apiKeyId, {
      lastUsedAt: now,
      usageCount: key.usageCount + 1,
      quotaWindowStartedAt: isCurrentWindow ? windowStartedAt : now,
      quotaUsed: nextQuotaUsed,
      updatedAt: now,
    });

    return {
      ok: true,
      organizationId: args.organizationId,
      apiKeyId,
      keyId: key.keyId,
      name: key.name,
      permissions: key.permissions,
    };
  },
});

export const readResource = query({
  args: {
    organizationId: v.string(),
    resource: apiKeyResourceValidator,
    action: apiKeyActionValidator,
    input: v.optional(v.any()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    if (args.action !== "read") throw new Error("Read endpoint requires read action.");
    const input = objectInput(args.input);

    if (args.resource === "organization") {
      const organization = await ctx.db
        .query("organizations")
        .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
        .unique();
      return organization ? present(organization) : null;
    }

    if (args.resource === "client") {
      const clientId = optionalString(input, "clientId");
      if (clientId) {
        const client = await ctx.db.get(clientId as Id<"clients">);
        if (!client || client.organizationId !== args.organizationId || client.deletedAt) return null;
        return present(client);
      }
      return listTable(ctx, args.organizationId, "clients", input);
    }

    if (args.resource === "property") {
      const propertyId = optionalString(input, "propertyId");
      if (propertyId) {
        const property = await ctx.db.get(propertyId as Id<"propertyUnits">);
        if (!property || property.organizationId !== args.organizationId || property.deletedAt) return null;
        return present(property);
      }
      return listTable(ctx, args.organizationId, "propertyUnits", input);
    }

    if (args.resource === "project") {
      const projectId = optionalString(input, "projectId");
      if (projectId) {
        const project = await ctx.db.get(projectId as Id<"projects">);
        if (!project || project.organizationId !== args.organizationId || project.deletedAt) return null;
        return present(project);
      }
      return listTable(ctx, args.organizationId, "projects", input);
    }

    if (args.resource === "task") {
      const taskId = optionalString(input, "taskId");
      if (taskId) {
        const task = await ctx.db.get(taskId as Id<"clientTasks">);
        if (!task || task.organizationId !== args.organizationId || task.deletedAt) return null;
        return present(task);
      }
      return listTable(ctx, args.organizationId, "clientTasks", input);
    }

    if (args.resource === "calendar") {
      const eventId = optionalString(input, "eventId");
      if (eventId) {
        const event = await ctx.db.get(eventId as Id<"calendarEvents">);
        if (!event || event.organizationId !== args.organizationId || event.deletedAt) return null;
        return present(event);
      }
      return listTable(ctx, args.organizationId, "calendarEvents", input);
    }

    if (args.resource === "media") {
      const resourceType = optionalString(input, "resourceType");
      const resourceId = optionalString(input, "resourceId");
      if (!resourceType || !resourceId) return [];
      const rows = await ctx.db
        .query("mediaAssets")
        .withIndex("by_organization_resource", (q) =>
          q
            .eq("organizationId", args.organizationId)
            .eq("resourceType", resourceType as "project" | "property" | "client" | "calendarEvent" | "task")
            .eq("resourceId", resourceId),
        )
        .take(limitFromInput(input));
      return rows.map(present);
    }

    return null;
  },
});

export const writeResource = mutation({
  args: {
    organizationId: v.string(),
    apiKeyId: v.id("organizationApiKeys"),
    resource: apiKeyResourceValidator,
    action: apiKeyActionValidator,
    input: v.optional(v.any()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const input = objectInput(args.input);
    const now = Date.now();
    if (args.resource !== "client") throw new Error("API key writes currently support clients only.");

    if (args.action === "create") {
      const id = await ctx.db.insert("clients", {
        organizationId: args.organizationId,
        name: requiredString(input, "name", "API client"),
        type: (optionalString(input, "type") ?? "Buyer") as "Buyer" | "Tenant" | "Investor" | "Broker",
        contact: requiredString(input, "contact", optionalString(input, "name") ?? "API client"),
        phone: requiredString(input, "phone", ""),
        age: optionalNumber(input, "age") ?? 0,
        nationality: requiredString(input, "nationality", ""),
        generation: requiredString(input, "generation", ""),
        budget: requiredString(input, "budget", ""),
        propertyInterest: requiredString(input, "propertyInterest", ""),
        status: (optionalString(input, "status") ?? "active") as "active" | "inactive",
        visibility: "private",
        pipelineStage: (optionalString(input, "pipelineStage") ?? "new") as "new" | "qualified" | "viewing" | "negotiation" | "closed",
        ...(optionalNumber(input, "pipelineOrder") !== undefined ? { pipelineOrder: optionalNumber(input, "pipelineOrder")! } : {}),
        priority: (optionalString(input, "priority") ?? "normal") as "normal" | "high" | "urgent",
        nextAction: requiredString(input, "nextAction", ""),
        issue: optionalString(input, "issue"),
        createdByUserId: `apiKey:${args.apiKeyId}`,
        createdAt: now,
        updatedAt: now,
      });
      await ctx.db.insert("organizationAuditEvents", {
        organizationId: args.organizationId,
        actorUserId: `apiKey:${args.apiKeyId}`,
        actorType: "apiKey",
        actorApiKeyId: args.apiKeyId,
        action: "apiKey.client.create",
        target: id,
        summary: "Created client from organization API key.",
        createdAt: now,
      });
      return present((await ctx.db.get(id))!);
    }

    const clientId = requiredString(input, "clientId") as Id<"clients">;
    const existing = await ctx.db.get(clientId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) {
      throw new Error("Client was not found.");
    }

    if (args.action === "update") {
      await ctx.db.patch(clientId, { ...clientPatch(input), updatedAt: now });
      await ctx.db.insert("organizationAuditEvents", {
        organizationId: args.organizationId,
        actorUserId: `apiKey:${args.apiKeyId}`,
        actorType: "apiKey",
        actorApiKeyId: args.apiKeyId,
        action: "apiKey.client.update",
        target: clientId,
        summary: "Updated client from organization API key.",
        createdAt: now,
      });
      return present((await ctx.db.get(clientId))!);
    }

    if (args.action === "delete") {
      await ctx.db.patch(clientId, { deletedAt: now, updatedAt: now });
      await ctx.db.insert("organizationAuditEvents", {
        organizationId: args.organizationId,
        actorUserId: `apiKey:${args.apiKeyId}`,
        actorType: "apiKey",
        actorApiKeyId: args.apiKeyId,
        action: "apiKey.client.delete",
        target: clientId,
        summary: "Deleted client from organization API key.",
        createdAt: now,
      });
      return { deleted: true };
    }

    throw new Error("Unsupported API key write action.");
  },
});
