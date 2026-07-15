import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { assertOrganizationPermission } from "../organizations/profile/access";
import { requireServerActor } from "../access/actor";
import { searchQueryConfigurationValidator, searchResourceTypeValidator } from "./validators";
import type { SearchFilterConfiguration } from "@qentrah/domain-contracts";

const savedQueryValidator = v.object({
  _id: v.id("searchSavedQueries"),
  _creationTime: v.number(),
  organizationId: v.string(),
  ownerUserId: v.string(),
  name: v.string(),
  query: searchQueryConfigurationValidator,
  revision: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

const recentQueryValidator = v.object({
  _id: v.id("searchRecentQueries"),
  _creationTime: v.number(),
  query: searchQueryConfigurationValidator,
  useCount: v.number(),
  updatedAt: v.number(),
});

export const listSaved = query({
  args: { organizationId: v.string() },
  returns: v.array(savedQueryValidator),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    const actor = await requireServerActor(ctx);
    const records = await ctx.db.query("searchSavedQueries").withIndex("by_owner_updated", (q) =>
      q.eq("organizationId", args.organizationId).eq("ownerUserId", actor.userId).eq("recordState", "active"),
    ).order("desc").collect();
    return records.map((record) => ({
      _id: record._id,
      _creationTime: record._creationTime,
      organizationId: record.organizationId,
      ownerUserId: record.ownerUserId,
      name: record.name,
      query: record.query,
      revision: record.revision,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    }));
  },
});

export const listRecent = query({
  args: { organizationId: v.string() },
  returns: v.array(recentQueryValidator),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    const actor = await requireServerActor(ctx);
    const records = await ctx.db.query("searchRecentQueries").withIndex("by_owner_updated", (q) =>
      q.eq("organizationId", args.organizationId).eq("ownerUserId", actor.userId),
    ).order("desc").take(10);
    return records.map((record) => ({
      _id: record._id,
      _creationTime: record._creationTime,
      query: record.query,
      useCount: record.useCount,
      updatedAt: record.updatedAt,
    }));
  },
});

export const save = mutation({
  args: { organizationId: v.string(), name: v.string(), query: searchQueryConfigurationValidator },
  returns: v.id("searchSavedQueries"),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    const actor = await requireServerActor(ctx);
    const name = args.name.trim();
    const configuration = normalizeSearchConfiguration(args.query);
    if (!name || name.length > 80) throw searchConfigurationError("SEARCH_NAME_INVALID", "Saved search names must be between 1 and 80 characters.");
    const now = Date.now();
    return ctx.db.insert("searchSavedQueries", {
      organizationId: args.organizationId,
      ownerUserId: actor.userId,
      name,
      query: configuration,
      revision: 1,
      recordState: "active",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const remove = mutation({
  args: { savedQueryId: v.id("searchSavedQueries") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const actor = await requireServerActor(ctx);
    const record = await ctx.db.get(args.savedQueryId);
    if (!record || record.recordState === "deleted") return null;
    await assertOrganizationPermission(ctx, record.organizationId, "read");
    if (record.ownerUserId !== actor.userId) throw searchConfigurationError("SEARCH_OWNER_REQUIRED", "Only the saved search owner can remove it.");
    const now = Date.now();
    await ctx.db.patch(record._id, { recordState: "deleted", deletedAt: now, updatedAt: now, revision: record.revision + 1 });
    return null;
  },
});

export const recordRecent = mutation({
  args: { organizationId: v.string(), query: searchQueryConfigurationValidator, resultCount: v.number() },
  returns: v.id("searchRecentQueries"),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    const actor = await requireServerActor(ctx);
    const configuration = normalizeSearchConfiguration(args.query);
    const fingerprint = searchConfigurationFingerprint(configuration);
    const now = Date.now();
    const existing = await ctx.db.query("searchRecentQueries").withIndex("by_owner_fingerprint", (q) =>
      q.eq("organizationId", args.organizationId).eq("ownerUserId", actor.userId).eq("fingerprint", fingerprint),
    ).unique();
    const id = existing?._id ?? await ctx.db.insert("searchRecentQueries", {
      organizationId: args.organizationId,
      ownerUserId: actor.userId,
      fingerprint,
      query: configuration,
      useCount: 0,
      createdAt: now,
      updatedAt: now,
    });
    if (existing) await ctx.db.patch(existing._id, { query: configuration, useCount: existing.useCount + 1, updatedAt: now });
    else await ctx.db.patch(id, { useCount: 1 });
    await ctx.db.insert("searchAnalyticsEvents", {
      organizationId: args.organizationId,
      actorUserId: actor.userId,
      eventType: "query_submitted",
      queryLength: configuration.search.length,
      resultCount: Math.max(0, Math.floor(args.resultCount)),
      filterCount: searchConfigurationFilterCount(configuration),
      createdAt: now,
    });
    const recent = await ctx.db.query("searchRecentQueries").withIndex("by_owner_updated", (q) =>
      q.eq("organizationId", args.organizationId).eq("ownerUserId", actor.userId),
    ).order("desc").take(30);
    for (const stale of recent.slice(20)) await ctx.db.delete(stale._id);
    return id;
  },
});

export const recordResultOpened = mutation({
  args: { organizationId: v.string(), queryLength: v.number(), resourceType: searchResourceTypeValidator, filterCount: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    const actor = await requireServerActor(ctx);
    await ctx.db.insert("searchAnalyticsEvents", {
      organizationId: args.organizationId,
      actorUserId: actor.userId,
      eventType: "result_opened",
      queryLength: Math.max(0, Math.floor(args.queryLength)),
      resourceType: args.resourceType,
      filterCount: Math.max(0, Math.floor(args.filterCount)),
      createdAt: Date.now(),
    });
    return null;
  },
});

export function normalizeSearchConfiguration(query: SearchFilterConfiguration): SearchFilterConfiguration {
  const search = query.search.trim();
  if (!search || search.length > 160) throw searchConfigurationError("SEARCH_QUERY_INVALID", "Search text must be between 1 and 160 characters.");
  if (query.dateFrom !== undefined && query.dateTo !== undefined && query.dateFrom > query.dateTo) {
    throw searchConfigurationError("SEARCH_DATE_RANGE_INVALID", "The search start date must be before the end date.");
  }
  return {
    search,
    resourceTypes: uniqueEnum(query.resourceTypes),
    scopeTypes: uniqueEnum(query.scopeTypes),
    sensitivity: uniqueEnum(query.sensitivity),
    locales: uniqueText(query.locales),
    spaceIds: uniqueText(query.spaceIds),
    projectIds: uniqueText(query.projectIds),
    ownerIds: uniqueText(query.ownerIds),
    assigneeIds: uniqueText(query.assigneeIds),
    clientIds: uniqueText(query.clientIds),
    statuses: uniqueText(query.statuses),
    tagIds: uniqueText(query.tagIds),
    dateFrom: query.dateFrom,
    dateTo: query.dateTo,
  };
}

function uniqueEnum<T extends string>(values?: T[]) {
  return values?.length ? [...new Set(values)].slice(0, 50) : undefined;
}

function uniqueText(values?: string[]) {
  return values?.length ? [...new Set(values.map((value) => value.trim()).filter(Boolean))].slice(0, 50) : undefined;
}

export function searchConfigurationFingerprint(query: SearchFilterConfiguration) {
  return JSON.stringify(query);
}

export function searchConfigurationFilterCount(query: SearchFilterConfiguration) {
  return Object.entries(query).filter(([key, value]) => key !== "search" && (Array.isArray(value) ? value.length : value !== undefined)).length;
}

function searchConfigurationError(code: string, message: string) {
  return new ConvexError({ code, message });
}
