import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { apiKeys } from "./apiKeys";
import { assertOrganizationEntitlement, consumeOrganizationEntitlement } from "./billing/access";
import { getAuthUser } from "./auth";
import { assertOrganizationResourcePermission } from "./organizations/profile/access";

export const ORGANIZATION_API_KEY_PREFIX = "qentrah_org_";
export const ORGANIZATION_API_KEY_QUOTA_LIMIT = 1_000;
export const ORGANIZATION_API_KEY_QUOTA_WINDOW_MS = 60 * 60 * 1000;

type ApiKeyResource = "organization" | "client" | "project" | "calendar" | "task" | "document" | "media" | "space";
type ApiKeyAction = "read" | "create" | "update" | "delete";
type ApiKeyPermission = { resource: ApiKeyResource; actions: ApiKeyAction[] };

export function organizationApiKeyStatus(key: Pick<Doc<"organizationApiKeys">, "status" | "expiresAt">, now = Date.now()) {
  return key.status === "active" && key.expiresAt && key.expiresAt <= now ? "expired" as const : key.status;
}

export function organizationApiKeyTtlMs(expiresAt: number | undefined, now = Date.now()) {
  return expiresAt ? Math.max(expiresAt - now, 0) : null;
}

export function orderedOrganizationApiKeys(keys: Doc<"organizationApiKeys">[]) {
  return keys.sort((a, b) => b.updatedAt - a.updatedAt);
}

export function presentOrganizationApiKey(key: Doc<"organizationApiKeys">, now = Date.now()) {
  return {
    _id: key._id,
    _creationTime: key._creationTime,
    id: key._id,
    organizationId: key.organizationId,
    keyId: key.keyId,
    keyLast4: key.keyLast4,
    name: key.name,
    permissions: key.permissions,
    status: organizationApiKeyStatus(key, now),
    createdByUserId: key.createdByUserId,
    createdAt: key.createdAt,
    updatedAt: key.updatedAt,
    lastUsedAt: key.lastUsedAt,
    expiresAt: key.expiresAt,
    usageCount: key.usageCount,
    quotaWindowStartedAt: key.quotaWindowStartedAt,
    quotaLimit: ORGANIZATION_API_KEY_QUOTA_LIMIT,
    quotaWindowMs: ORGANIZATION_API_KEY_QUOTA_WINDOW_MS,
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

export async function assertApiKeyManagementPermission(
  ctx: QueryCtx | MutationCtx,
  organizationId: string,
  action: "create" | "read" | "update" | "delete",
) {
  await assertOrganizationResourcePermission(ctx, organizationId, "apiKey", action);
}

async function assertDelegatedPermissions(
  ctx: MutationCtx,
  organizationId: string,
  permissions: ApiKeyPermission[],
) {
  for (const permission of permissions) {
    for (const action of permission.actions) {
      if (permission.resource === "document") {
        await assertOrganizationResourcePermission(ctx, organizationId, "organization", action === "read" ? "read" : "update");
      } else {
        await assertOrganizationResourcePermission(ctx, organizationId, permission.resource, action);
      }
    }
  }
}

export async function listOrganizationApiKeys(ctx: QueryCtx, organizationId: string) {
  await assertApiKeyManagementPermission(ctx, organizationId, "read");
  const keys = await ctx.db
    .query("organizationApiKeys")
    .withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId))
    .take(500);

  return orderedOrganizationApiKeys(keys).map(presentOrganizationApiKey);
}

export async function createOrganizationApiKey(
  ctx: MutationCtx,
  args: {
    organizationId: string;
    input: {
      name: string;
      permissions: ApiKeyPermission[];
      expiresAt?: number;
    };
  },
) {
  const user = await getAuthUser(ctx);
  await assertApiKeyManagementPermission(ctx, args.organizationId, "create");
  await assertOrganizationEntitlement(ctx, { organizationId: args.organizationId, key: "api_call" });
  await assertDelegatedPermissions(ctx, args.organizationId, args.input.permissions);

  const now = Date.now();
  const apiKeyId = await ctx.db.insert("organizationApiKeys", {
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
    prefix: ORGANIZATION_API_KEY_PREFIX,
    permissions: permissionRecord(args.input.permissions),
    metadata: { kind: "orgApiKey", organizationId: args.organizationId, apiKeyId },
    ttlMs: organizationApiKeyTtlMs(args.input.expiresAt, now),
    idleTimeoutMs: null,
  });

  await ctx.db.patch(apiKeyId, {
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
    target: apiKeyId,
    summary: `Created API key ${args.input.name}.`,
    createdAt: now,
  });

  const key = await ctx.db.get(apiKeyId);
  if (!key) throw new Error("API key could not be created.");
  return { key: presentOrganizationApiKey(key), secret: created.token };
}

export async function rotateOrganizationApiKey(
  ctx: MutationCtx,
  args: {
    organizationId: string;
    apiKeyId: Id<"organizationApiKeys">;
    input: { expiresAt?: number };
  },
) {
  const user = await getAuthUser(ctx);
  await assertApiKeyManagementPermission(ctx, args.organizationId, "update");
  const existing = await ctx.db.get(args.apiKeyId);
  if (!existing || existing.organizationId !== args.organizationId || existing.status === "revoked") {
    throw new Error("API key was not found.");
  }

  const now = Date.now();
  const rotated = await apiKeys.refresh(ctx, {
    keyId: existing.keyId,
    prefix: ORGANIZATION_API_KEY_PREFIX,
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
  return { key: presentOrganizationApiKey(key), secret: rotated.token };
}

export async function revokeOrganizationApiKey(
  ctx: MutationCtx,
  args: { organizationId: string; apiKeyId: Id<"organizationApiKeys"> },
) {
  const user = await getAuthUser(ctx);
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
}

export async function validateAndReserveOrganizationApiKey(
  ctx: MutationCtx,
  args: {
    organizationId: string;
    secret: string;
    resource: ApiKeyResource;
    action: ApiKeyAction;
  },
) {
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

  await consumeOrganizationEntitlement(ctx, {
    organizationId: args.organizationId,
    key: "api_call",
    units: 1,
  });

  const now = Date.now();
  const windowStartedAt = key.quotaWindowStartedAt ?? now;
  const isCurrentWindow = now - windowStartedAt < ORGANIZATION_API_KEY_QUOTA_WINDOW_MS;
  const nextQuotaUsed = isCurrentWindow ? (key.quotaUsed ?? 0) + 1 : 1;
  if (nextQuotaUsed > ORGANIZATION_API_KEY_QUOTA_LIMIT) return { ok: false, reason: "rate_limited" };

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
}
