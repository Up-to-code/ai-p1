import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  assertPartnerResourceBridgeToken,
  readPartnerResourceThroughGateway,
  writePartnerResourceThroughGateway,
} from "./partnerResourceGateway";
import {
  createOrganizationApiKey,
  listOrganizationApiKeys,
  revokeOrganizationApiKey,
  rotateOrganizationApiKey,
  validateAndReserveOrganizationApiKey,
} from "./organizationApiKeyLifecycle";

const DEFAULT_LIMIT = 100;

const apiKeyResourceValidator = v.union(
  v.literal("organization"),
  v.literal("client"),
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

export const list = query({
  args: { organizationId: v.string() },
  returns: v.array(apiKeySummaryValidator),
  handler: async (ctx, args) => {
    return listOrganizationApiKeys(ctx, args.organizationId);
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
    return createOrganizationApiKey(ctx, args);
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
    return rotateOrganizationApiKey(ctx, args);
  },
});

export const revokeFromHono = mutation({
  args: { organizationId: v.string(), apiKeyId: v.id("organizationApiKeys") },
  returns: v.object({ revoked: v.boolean() }),
  handler: async (ctx, args) => {
    return revokeOrganizationApiKey(ctx, args);
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
    return validateAndReserveOrganizationApiKey(ctx, args);
  },
});

export const readResource = query({
  args: {
    serverToken: v.string(),
    organizationId: v.string(),
    resource: apiKeyResourceValidator,
    action: apiKeyActionValidator,
    input: v.optional(v.any()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    assertPartnerResourceBridgeToken(args.serverToken);
    return readPartnerResourceThroughGateway(ctx, {
      organizationId: args.organizationId,
      resource: args.resource,
      action: args.action,
      input: args.input,
      defaultLimit: DEFAULT_LIMIT,
    });
  },
});

export const writeResource = mutation({
  args: {
    serverToken: v.string(),
    organizationId: v.string(),
    apiKeyId: v.id("organizationApiKeys"),
    resource: apiKeyResourceValidator,
    action: apiKeyActionValidator,
    input: v.optional(v.any()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    assertPartnerResourceBridgeToken(args.serverToken);
    return writePartnerResourceThroughGateway(ctx, {
      organizationId: args.organizationId,
      resource: args.resource,
      action: args.action,
      input: args.input,
      actor: {
        type: "apiKey",
        apiKeyId: args.apiKeyId,
      },
    });
  },
});
