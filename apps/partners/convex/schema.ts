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
