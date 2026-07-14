import { v } from "convex/values";

export const searchResourceTypeValidator = v.union(
  v.literal("space"), v.literal("project"), v.literal("task"), v.literal("document"), v.literal("attachment"), v.literal("comment"), v.literal("message"),
  v.literal("client"), v.literal("contact"), v.literal("company"), v.literal("deal"), v.literal("proposal"), v.literal("contract"),
  v.literal("engagement"), v.literal("deliverable"), v.literal("approval"), v.literal("invoice"), v.literal("expense"), v.literal("payment"),
);
export const searchScopeTypeValidator = v.union(v.literal("organization"), v.literal("space"), v.literal("project"), v.literal("private"));
export const searchSensitivityValidator = v.union(v.literal("standard"), v.literal("restricted"), v.literal("confidential"));
export const searchOutboxStatusValidator = v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("dead_letter"));
export const searchQueryConfigurationValidator = v.object({
  search: v.string(),
  resourceTypes: v.optional(v.array(searchResourceTypeValidator)),
  scopeTypes: v.optional(v.array(searchScopeTypeValidator)),
  sensitivity: v.optional(v.array(searchSensitivityValidator)),
  locales: v.optional(v.array(v.string())),
  spaceIds: v.optional(v.array(v.string())),
  projectIds: v.optional(v.array(v.string())),
  ownerIds: v.optional(v.array(v.string())),
  assigneeIds: v.optional(v.array(v.string())),
  clientIds: v.optional(v.array(v.string())),
  statuses: v.optional(v.array(v.string())),
  tagIds: v.optional(v.array(v.string())),
  dateFrom: v.optional(v.number()),
  dateTo: v.optional(v.number()),
});
export const searchProjectionFields = {
  organizationId: v.string(), resourceType: searchResourceTypeValidator, resourceId: v.string(), route: v.string(),
  title: v.string(), subtitle: v.optional(v.string()), identifier: v.optional(v.string()), searchText: v.string(), keywords: v.array(v.string()),
  locale: v.string(), scopeType: searchScopeTypeValidator, spaceIds: v.array(v.string()), projectIds: v.array(v.string()), principalKeys: v.array(v.string()),
  ownerIds: v.optional(v.array(v.string())), assigneeIds: v.optional(v.array(v.string())), clientIds: v.optional(v.array(v.string())),
  statuses: v.optional(v.array(v.string())), tagIds: v.optional(v.array(v.string())), dateValue: v.optional(v.number()),
  sensitivity: searchSensitivityValidator, sourceUpdatedAt: v.number(), version: v.number(), deletedAt: v.optional(v.number()),
};
export const searchProjectionInputValidator = v.object(searchProjectionFields);
export const searchProjectionValidator = v.object({
  _id: v.id("searchProjections"),
  _creationTime: v.number(),
  ...searchProjectionFields,
});
export const searchOutboxEventValidator = v.object({
  _id: v.id("searchOutboxEvents"),
  _creationTime: v.number(),
  organizationId: v.string(),
  resourceType: searchResourceTypeValidator,
  resourceId: v.string(),
  projectionVersion: v.number(),
  operation: v.union(v.literal("upsert"), v.literal("delete")),
  status: searchOutboxStatusValidator,
  attempts: v.number(),
  nextAttemptAt: v.number(),
  claimedAt: v.optional(v.number()),
  completedAt: v.optional(v.number()),
  lastError: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
});
export const searchPolicyValidator = v.object({
  _id: v.id("searchPolicies"),
  _creationTime: v.number(),
  organizationId: v.string(),
  enabledResourceTypes: v.array(searchResourceTypeValidator),
  attachmentExtractionEnabled: v.boolean(),
  ocrEnabled: v.boolean(),
  externallyIndexRestricted: v.boolean(),
  externallyIndexConfidential: v.boolean(),
  allowedMimeTypes: v.array(v.string()),
  defaultLocale: v.string(),
  fallbackLocales: v.array(v.string()),
  version: v.number(),
  updatedByUserId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
});
export const searchCandidateInputValidator = v.object({
  resourceType: searchResourceTypeValidator,
  resourceId: v.string(),
  version: v.number(),
  score: v.number(),
});

export const hydratedSearchResultValidator = v.object({
  resourceType: searchResourceTypeValidator,
  resourceId: v.string(),
  title: v.string(),
  subtitle: v.optional(v.string()),
  route: v.string(),
  score: v.number(),
  capabilities: v.object({
    canRead: v.boolean(),
    canUpdate: v.boolean(),
    canDelete: v.boolean(),
  }),
});
