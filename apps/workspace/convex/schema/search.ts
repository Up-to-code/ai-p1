import { defineTable } from "convex/server";
import { v } from "convex/values";
import { searchOutboxStatusValidator, searchProjectionFields, searchResourceTypeValidator, searchSensitivityValidator } from "../search/validators";

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
    organizationId: v.string(), mediaId: v.string(), status: v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("failed")),
    extractor: v.union(v.literal("tika"), v.literal("tesseract")), extractorVersion: v.string(), ocrLanguages: v.array(v.string()),
    attempts: v.number(), nextAttemptAt: v.number(), failureReason: v.optional(v.string()), createdAt: v.number(), updatedAt: v.number(),
  }).index("by_status_attempt", ["status", "nextAttemptAt"]).index("by_media", ["organizationId", "mediaId"]),
};
