import { v } from "convex/values";

export const searchResourceTypeValidator = v.union(
  v.literal("space"), v.literal("project"), v.literal("task"), v.literal("document"), v.literal("comment"), v.literal("message"),
  v.literal("client"), v.literal("contact"), v.literal("company"), v.literal("deal"), v.literal("proposal"), v.literal("contract"),
  v.literal("engagement"), v.literal("deliverable"), v.literal("approval"), v.literal("invoice"), v.literal("expense"), v.literal("payment"),
);
export const searchScopeTypeValidator = v.union(v.literal("organization"), v.literal("space"), v.literal("project"), v.literal("private"));
export const searchSensitivityValidator = v.union(v.literal("standard"), v.literal("restricted"), v.literal("confidential"));
export const searchOutboxStatusValidator = v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("dead_letter"));
export const searchProjectionFields = {
  organizationId: v.string(), resourceType: searchResourceTypeValidator, resourceId: v.string(), route: v.string(),
  title: v.string(), subtitle: v.optional(v.string()), identifier: v.optional(v.string()), searchText: v.string(), keywords: v.array(v.string()),
  locale: v.string(), scopeType: searchScopeTypeValidator, spaceIds: v.array(v.string()), projectIds: v.array(v.string()), principalKeys: v.array(v.string()),
  sensitivity: searchSensitivityValidator, sourceUpdatedAt: v.number(), version: v.number(), deletedAt: v.optional(v.number()),
};
export const searchProjectionInputValidator = v.object(searchProjectionFields);
