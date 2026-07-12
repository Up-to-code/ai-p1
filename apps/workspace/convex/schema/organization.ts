import { defineTable } from "convex/server";
import { v } from "convex/values";

export const organizationTables = {
  organizations: defineTable({
    organizationId: v.string(),
    name: v.string(),
    legalName: v.string(),
    type: v.string(),
    email: v.string(),
    phone: v.string(),
    website: v.string(),
    address: v.string(),
    logo: v.optional(v.string()),
    brandColor: v.optional(v.string()),
    workosOrganizationId: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_updated", ["updatedAt"]),

  organizationAuditEvents: defineTable({
    organizationId: v.string(),
    actorUserId: v.string(),
    actorType: v.optional(v.union(v.literal("user"), v.literal("mcpConnection"), v.literal("partnerApp"), v.literal("apiKey"))),
    actorMcpConnectionId: v.optional(v.string()),
    actorPartnerAppId: v.optional(v.string()),
    actorApiKeyId: v.optional(v.string()),
    action: v.string(),
    target: v.string(),
    summary: v.string(),
    createdAt: v.number(),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_created", ["createdAt"]),

  organizationSecurityUpdates: defineTable({
    organizationId: v.string(),
    category: v.union(
      v.literal("verification"),
      v.literal("invitation"),
      v.literal("authorization"),
      v.literal("security"),
      v.literal("account"),
      v.literal("other"),
    ),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("resolved"),
      v.literal("archived"),
    ),
    severity: v.optional(v.union(
      v.literal("info"),
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical"),
    )),
    source: v.optional(v.union(
      v.literal("manual"),
      v.literal("system"),
      v.literal("auth"),
      v.literal("integration"),
    )),
    relatedRecordType: v.optional(v.string()),
    relatedRecordId: v.optional(v.string()),
    createdByUserId: v.optional(v.string()),
    resolvedByUserId: v.optional(v.string()),
    resolvedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_category_status_updated", ["organizationId", "category", "status", "updatedAt"])
    .index("by_organization_status_updated", ["organizationId", "status", "updatedAt"]),

  organizationInviteLinks: defineTable({
    organizationId: v.string(),
    role: v.string(),
    tokenHash: v.string(),
    status: v.union(v.literal("pending"), v.literal("used"), v.literal("canceled")),
    createdByUserId: v.string(),
    expiresAt: v.number(),
    usedAt: v.optional(v.number()),
    usedByUserId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_status_expires", ["organizationId", "status", "expiresAt"])
    .index("by_organization_role_status_expires", ["organizationId", "role", "status", "expiresAt"])
    .index("by_token_hash", ["tokenHash"]),

  organizationWorkRoles: defineTable({
    organizationId: v.string(),
    role: v.string(),
    permission: v.record(v.string(), v.array(v.string())),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_role", ["organizationId", "role"]),

  organizationMcpConnections: defineTable({
    organizationId: v.string(),
    publicId: v.string(),
    keyId: v.string(),
    tokenHash: v.optional(v.string()),
    keyLast4: v.string(),
    name: v.string(),
    instructions: v.optional(v.string()),
    permissions: v.array(v.object({
      resource: v.union(
        v.literal("organization"),
        v.literal("client"),
        v.literal("project"),
        v.literal("deal"),
        v.literal("calendar"),
        v.literal("task"),
        v.literal("media"),
        v.literal("space"),
      ),
      actions: v.array(v.union(
        v.literal("read"),
        v.literal("create"),
        v.literal("update"),
        v.literal("delete"),
      )),
    })),
    scope: v.optional(v.object({
      type: v.union(v.literal("organization"), v.literal("space"), v.literal("project")),
      spaceIds: v.optional(v.array(v.id("spaces"))),
      projectIds: v.optional(v.array(v.id("projects"))),
    })),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("draft"), v.literal("revoked")),
    principalType: v.optional(v.union(v.literal("user"), v.literal("organization"))),
    principalUserId: v.optional(v.string()),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastUsedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    usageCount: v.number(),
    rateLimitWindowStartedAt: v.optional(v.number()),
    rateLimitCount: v.optional(v.number()),
    revokedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_public_id", ["publicId"])
    .index("by_key_id", ["keyId"])
    .index("by_token_hash", ["tokenHash"])
    .index("by_status_updated", ["status", "updatedAt"]),

  mcpConnectionProfiles: defineTable({
    organizationId: v.string(),
    publicId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    permissions: v.array(v.object({
      resource: v.union(
        v.literal("organization"), v.literal("client"), v.literal("project"),
        v.literal("deal"), v.literal("calendar"), v.literal("task"),
        v.literal("media"), v.literal("space"),
      ),
      actions: v.array(v.union(
        v.literal("read"), v.literal("create"), v.literal("update"), v.literal("delete"),
      )),
    })),
    scope: v.object({
      type: v.union(v.literal("organization"), v.literal("space"), v.literal("project")),
      spaceIds: v.optional(v.array(v.id("spaces"))),
      projectIds: v.optional(v.array(v.id("projects"))),
    }),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_organization", ["createdByUserId", "organizationId"])
    .index("by_public_id", ["publicId"]),

  mcpOAuthGrants: defineTable({
    organizationId: v.string(),
    userId: v.string(),
    oauthClientId: v.string(),
    clientName: v.string(),
    permissions: v.array(v.object({
      resource: v.union(
        v.literal("organization"), v.literal("client"), v.literal("project"),
        v.literal("deal"), v.literal("calendar"), v.literal("task"),
        v.literal("media"), v.literal("space"),
      ),
      actions: v.array(v.union(
        v.literal("read"), v.literal("create"), v.literal("update"), v.literal("delete"),
      )),
    })),
    scope: v.object({
      type: v.union(v.literal("organization"), v.literal("space"), v.literal("project")),
      spaceIds: v.optional(v.array(v.id("spaces"))),
      projectIds: v.optional(v.array(v.id("projects"))),
    }),
    status: v.union(v.literal("active"), v.literal("revoked")),
    createdAt: v.number(),
    updatedAt: v.number(),
    expiresAt: v.number(),
    lastUsedAt: v.optional(v.number()),
    revokedAt: v.optional(v.number()),
    usageCount: v.number(),
  })
    .index("by_user_organization", ["userId", "organizationId"])
    .index("by_user_organization_client", ["userId", "organizationId", "oauthClientId"])
    .index("by_organization", ["organizationId"]),

  mcpRateLimits: defineTable({
    key: v.string(),
    windowStartedAt: v.number(),
    count: v.number(),
    expiresAt: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_expiry", ["expiresAt"]),

  organizationApiKeys: defineTable({
    organizationId: v.string(),
    keyId: v.string(),
    keyLast4: v.string(),
    name: v.string(),
    permissions: v.array(v.object({
      resource: v.union(
        v.literal("organization"),
        v.literal("client"),
        v.literal("project"),
        v.literal("calendar"),
        v.literal("task"),
        v.literal("document"),
        v.literal("media"),
        v.literal("space"),
      ),
      actions: v.array(v.union(
        v.literal("read"),
        v.literal("create"),
        v.literal("update"),
        v.literal("delete"),
      )),
    })),
    status: v.union(v.literal("active"), v.literal("revoked")),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastUsedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    usageCount: v.number(),
    quotaWindowStartedAt: v.optional(v.number()),
    quotaUsed: v.optional(v.number()),
    revokedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_key_id", ["keyId"])
    .index("by_status_updated", ["status", "updatedAt"]),

  memories: defineTable({
    organizationId: v.string(),
    userId: v.string(),
    key: v.string(),
    value: v.string(),
    updatedAt: v.number(),
  })
    .index("by_org_user", ["organizationId", "userId"])
    .index("by_org_user_key", ["organizationId", "userId", "key"]),

  organizationPartnerConnections: defineTable({
    organizationId: v.string(),
    partnersAppId: v.string(),
    partnersClientId: v.string(),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("revoked")),
    scopes: v.array(v.string()),
    authorizedByUserId: v.string(),
    authorizedMemberId: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    lastVerifiedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    revokedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_app", ["organizationId", "partnersAppId"])
    .index("by_client_organization", ["partnersClientId", "organizationId"])
    .index("by_status_updated", ["status", "updatedAt"]),
};
