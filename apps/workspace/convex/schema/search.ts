import { defineTable } from "convex/server";
import { v } from "convex/values";
import { searchOutboxStatusValidator, searchProjectionFields, searchQueryConfigurationValidator, searchResourceTypeValidator } from "../search/validators";

export const searchTables = {
  searchProjections: defineTable(searchProjectionFields)
    .index("by_resource", ["organizationId", "resourceType", "resourceId"])
    .index("by_scope_version", ["organizationId", "scopeType", "version"])
    .index("by_source_updated", ["organizationId", "resourceType", "sourceUpdatedAt"]),
  searchOutboxEvents: defineTable({
    organizationId: v.string(), resourceType: searchResourceTypeValidator, resourceId: v.string(),
    projectionVersion: v.number(), operation: v.union(v.literal("upsert"), v.literal("delete")),
    status: searchOutboxStatusValidator, attempts: v.number(), nextAttemptAt: v.number(),
    claimedAt: v.optional(v.number()), completedAt: v.optional(v.number()), lastError: v.optional(v.string()),
    createdAt: v.number(), updatedAt: v.number(),
  })
    .index("by_status_attempt", ["status", "nextAttemptAt"])
    .index("by_organization_status_attempt", ["organizationId", "status", "nextAttemptAt"])
    .index("by_organization_resource_version", ["organizationId", "resourceType", "resourceId", "projectionVersion"]),
  searchPolicies: defineTable({
    organizationId: v.string(), enabledResourceTypes: v.array(searchResourceTypeValidator),
    attachmentExtractionEnabled: v.boolean(), ocrEnabled: v.boolean(),
    externallyIndexRestricted: v.boolean(), externallyIndexConfidential: v.boolean(),
    allowedMimeTypes: v.array(v.string()), defaultLocale: v.string(), fallbackLocales: v.array(v.string()),
    version: v.number(), updatedByUserId: v.string(), createdAt: v.number(), updatedAt: v.number(),
  }).index("by_organization", ["organizationId"]),
  extractionJobs: defineTable({
    organizationId: v.string(), mediaId: v.string(), status: v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("failed"), v.literal("dead_letter")),
    extractor: v.union(v.literal("tika"), v.literal("tesseract")), extractorVersion: v.string(), ocrLanguages: v.array(v.string()),
    attempts: v.number(), nextAttemptAt: v.number(), failureReason: v.optional(v.string()), claimedAt: v.optional(v.number()),
    sourceUpdatedAt: v.number(), completedAt: v.optional(v.number()), createdAt: v.number(), updatedAt: v.number(),
  })
    .index("by_status_attempt", ["status", "nextAttemptAt"])
    .index("by_organization_status_attempt", ["organizationId", "status", "nextAttemptAt"])
    .index("by_media", ["organizationId", "mediaId"]),
  mediaSecurityJobs: defineTable({
    organizationId: v.string(),
    mediaId: v.id("mediaAssets"),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("clean"), v.literal("quarantined"), v.literal("dead_letter")),
    attempts: v.number(),
    nextAttemptAt: v.number(),
    claimedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    engine: v.optional(v.string()),
    engineVersion: v.optional(v.string()),
    signature: v.optional(v.string()),
    failureReason: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status_attempt", ["status", "nextAttemptAt"])
    .index("by_organization_status_attempt", ["organizationId", "status", "nextAttemptAt"])
    .index("by_media", ["organizationId", "mediaId"]),
  extractedSearchContent: defineTable({
    organizationId: v.string(),
    mediaId: v.id("mediaAssets"),
    sourceUpdatedAt: v.number(),
    sourceMimeType: v.string(),
    text: v.string(),
    locale: v.string(),
    metadata: v.array(v.object({ key: v.string(), value: v.string() })),
    extractor: v.union(v.literal("tika"), v.literal("tesseract")),
    extractorVersion: v.string(),
    ocrLanguages: v.array(v.string()),
    extractedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_media", ["organizationId", "mediaId"])
    .index("by_organization_updated", ["organizationId", "updatedAt"]),
  searchIndexStates: defineTable({
    indexName: v.string(),
    settingsVersion: v.number(),
    configuredAt: v.number(),
  }).index("by_index_name", ["indexName"]),
  searchReindexJobs: defineTable({
    organizationId: v.string(),
    resourceType: v.union(v.literal("project"), v.literal("task"), v.literal("lead"), v.literal("company"), v.literal("contact"), v.literal("proposal"), v.literal("contract"), v.literal("engagement"), v.literal("deliverable"), v.literal("invoice"), v.literal("expense"), v.literal("payment")),
    status: v.union(v.literal("pending"), v.literal("running"), v.literal("completed"), v.literal("failed")),
    cursor: v.optional(v.string()),
    processed: v.number(),
    error: v.optional(v.string()),
    requestedByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_status_updated", ["status", "updatedAt"])
    .index("by_organization_status", ["organizationId", "status"])
    .index("by_organization_resource_status", ["organizationId", "resourceType", "status"]),
  searchSavedQueries: defineTable({
    organizationId: v.string(),
    ownerUserId: v.string(),
    name: v.string(),
    query: searchQueryConfigurationValidator,
    revision: v.number(),
    recordState: v.union(v.literal("active"), v.literal("deleted")),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_owner_updated", ["organizationId", "ownerUserId", "recordState", "updatedAt"]),
  searchRecentQueries: defineTable({
    organizationId: v.string(),
    ownerUserId: v.string(),
    fingerprint: v.string(),
    query: searchQueryConfigurationValidator,
    useCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner_fingerprint", ["organizationId", "ownerUserId", "fingerprint"])
    .index("by_owner_updated", ["organizationId", "ownerUserId", "updatedAt"]),
  searchAnalyticsEvents: defineTable({
    organizationId: v.string(),
    actorUserId: v.string(),
    eventType: v.union(v.literal("query_submitted"), v.literal("result_opened")),
    queryLength: v.number(),
    resourceType: v.optional(searchResourceTypeValidator),
    resultCount: v.optional(v.number()),
    filterCount: v.number(),
    createdAt: v.number(),
  }).index("by_organization_created", ["organizationId", "createdAt"]),
};
