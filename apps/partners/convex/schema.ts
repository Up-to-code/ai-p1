import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const partnerAppStatusValidator = v.union(
  v.literal("draft"),
  v.literal("pending_review"),
  v.literal("active"),
  v.literal("rejected"),
  v.literal("suspended"),
);

export const partnerAppClientTypeValidator = v.union(v.literal("public"), v.literal("confidential"));

export const hubSyncStatusValidator = v.union(
  v.literal("not_synced"),
  v.literal("pending"),
  v.literal("synced"),
  v.literal("failed"),
);

export const sandboxResourceTypeValidator = v.union(
  v.literal("organization"),
  v.literal("client"),
  v.literal("property"),
  v.literal("project"),
  v.literal("task"),
  v.literal("calendar"),
  v.literal("media"),
);

export const sandboxActionValidator = v.union(
  v.literal("read"),
  v.literal("create"),
  v.literal("update"),
  v.literal("delete"),
);

export default defineSchema({
  partnerProfiles: defineTable({
    authSubject: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_authSubject", ["authSubject"]),

  partnerOrganizations: defineTable({
    ownerAuthSubject: v.string(),
    tenantOrganizationId: v.optional(v.string()),
    name: v.string(),
    type: v.literal("programmer"),
    countryCode: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_ownerAuthSubject", ["ownerAuthSubject"])
    .index("by_tenantOrganizationId", ["tenantOrganizationId"]),

  partnerApps: defineTable({
    partnerAuthSubject: v.string(),
    partnerOrganizationId: v.optional(v.id("partnerOrganizations")),
    clientId: v.string(),
    clientSecretHash: v.optional(v.string()),
    name: v.string(),
    publisherName: v.string(),
    homepageUrl: v.optional(v.string()),
    iconUrl: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    clientType: partnerAppClientTypeValidator,
    redirectUris: v.array(v.string()),
    allowedScopes: v.array(v.string()),
    status: partnerAppStatusValidator,
    hubPartnerAppId: v.optional(v.string()),
    hubOauthClientId: v.optional(v.string()),
    hubSyncStatus: v.optional(hubSyncStatusValidator),
    hubSyncError: v.optional(v.string()),
    ananWorkspaceClientId: v.optional(v.string()),
    authorizationExpiresAfterDays: v.number(),
    reviewNotes: v.optional(v.string()),
    submittedAt: v.optional(v.number()),
    reviewedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_partnerAuthSubject", ["partnerAuthSubject"])
    .index("by_clientId", ["clientId"])
    .index("by_status", ["status"]),

  sandboxOrganizations: defineTable({
    partnerAuthSubject: v.string(),
    partnerAppId: v.id("partnerApps"),
    organizationId: v.string(),
    name: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_partnerAppId", ["partnerAppId"])
    .index("by_organizationId", ["organizationId"])
    .index("by_partnerAuthSubject", ["partnerAuthSubject"]),

  sandboxOAuthCodes: defineTable({
    partnerAuthSubject: v.string(),
    partnerAppId: v.id("partnerApps"),
    organizationId: v.string(),
    code: v.string(),
    clientId: v.string(),
    redirectUri: v.string(),
    scopes: v.array(v.string()),
    codeChallenge: v.string(),
    codeChallengeMethod: v.literal("S256"),
    expiresAt: v.number(),
    consumedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_partnerAppId", ["partnerAppId"]),

  sandboxOAuthTokens: defineTable({
    partnerAuthSubject: v.string(),
    partnerAppId: v.id("partnerApps"),
    organizationId: v.string(),
    accessTokenHash: v.optional(v.string()),
    refreshTokenHash: v.optional(v.string()),
    clientId: v.string(),
    scopes: v.array(v.string()),
    status: v.union(v.literal("active"), v.literal("rotated"), v.literal("revoked")),
    accessExpiresAt: v.number(),
    refreshExpiresAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_accessTokenHash", ["accessTokenHash"])
    .index("by_refreshTokenHash", ["refreshTokenHash"])
    .index("by_partnerAppId", ["partnerAppId"]),

  sandboxResources: defineTable({
    partnerAuthSubject: v.string(),
    partnerAppId: v.id("partnerApps"),
    organizationId: v.string(),
    resourceType: sandboxResourceTypeValidator,
    data: v.any(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization_resource", ["organizationId", "resourceType"])
    .index("by_partnerAppId", ["partnerAppId"]),

  sandboxRequestLogs: defineTable({
    partnerAuthSubject: v.optional(v.string()),
    partnerAppId: v.optional(v.id("partnerApps")),
    organizationId: v.optional(v.string()),
    method: v.string(),
    path: v.string(),
    status: v.number(),
    latencyMs: v.number(),
    scopes: v.array(v.string()),
    input: v.optional(v.any()),
    response: v.optional(v.any()),
    error: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_partnerAppId", ["partnerAppId"])
    .index("by_organizationId", ["organizationId"]),

  partnerAppReviews: defineTable({
    appId: v.id("partnerApps"),
    status: partnerAppStatusValidator,
    reviewerAuthSubject: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_appId", ["appId"]),

  partnerEvents: defineTable({
    actorAuthSubject: v.optional(v.string()),
    appId: v.optional(v.id("partnerApps")),
    eventType: v.string(),
    payload: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_actorAuthSubject", ["actorAuthSubject"])
    .index("by_appId", ["appId"])
    .index("by_eventType", ["eventType"]),

  ananWorkspaceLinks: defineTable({
    partnerAppId: v.id("partnerApps"),
    ananWorkspaceId: v.string(),
    ananOrganizationId: v.string(),
    grantedScopes: v.array(v.string()),
    status: v.union(v.literal("pending"), v.literal("active"), v.literal("revoked"), v.literal("expired")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_partnerAppId", ["partnerAppId"])
    .index("by_ananWorkspaceId", ["ananWorkspaceId"])
    .index("by_status", ["status"]),

  ananIntegrationEvents: defineTable({
    direction: v.union(v.literal("outbound"), v.literal("inbound")),
    contract: v.string(),
    idempotencyKey: v.string(),
    status: v.union(v.literal("pending"), v.literal("delivered"), v.literal("failed"), v.literal("dead_letter")),
    attempts: v.number(),
    payload: v.any(),
    lastError: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_idempotencyKey", ["idempotencyKey"])
    .index("by_status", ["status"])
    .index("by_contract", ["contract"]),
});
