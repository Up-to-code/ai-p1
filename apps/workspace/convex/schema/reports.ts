import { defineTable } from "convex/server";
import { v } from "convex/values";

const reportSource = v.union(
  v.literal("executive"), v.literal("sales"), v.literal("pipeline"),
  v.literal("delivery"), v.literal("resource_utilization"), v.literal("capacity"),
  v.literal("project_profitability"), v.literal("client_profitability"),
  v.literal("finance"), v.literal("tax"),
);
const visibility = v.union(v.literal("personal"), v.literal("shared"), v.literal("protected"));
const audit = { createdByUserId: v.string(), createdAt: v.number(), updatedAt: v.number(), deletedAt: v.optional(v.number()) };

export const reportTables = {
  reportDefinitions: defineTable({
    organizationId: v.string(), name: v.string(), source: reportSource,
    visibility, scopeType: v.union(v.literal("organization"), v.literal("space"), v.literal("project")),
    scopeId: v.optional(v.string()), filtersJson: v.string(), dimensions: v.array(v.string()),
    measures: v.array(v.string()), revision: v.number(), ...audit,
  }).index("by_org_source_updated", ["organizationId", "source", "updatedAt"])
    .index("by_owner_updated", ["organizationId", "createdByUserId", "updatedAt"]),
  reportGrants: defineTable({
    organizationId: v.string(), reportId: v.id("reportDefinitions"),
    principalType: v.union(v.literal("user"), v.literal("team")), principalId: v.string(),
    createdByUserId: v.string(), createdAt: v.number(), deletedAt: v.optional(v.number()),
  }).index("by_report_principal", ["organizationId", "reportId", "principalType", "principalId"])
    .index("by_principal_report", ["organizationId", "principalType", "principalId", "reportId"]),
  reportSchedules: defineTable({
    organizationId: v.string(), reportId: v.id("reportDefinitions"),
    cadence: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
    timezone: v.string(), recipients: v.array(v.string()), active: v.boolean(), nextRunAt: v.number(),
    ...audit,
  }).index("by_org_next_run", ["organizationId", "active", "nextRunAt"])
    .index("by_report_active", ["organizationId", "reportId", "active"]),
  reportRuns: defineTable({
    organizationId: v.string(), reportId: v.id("reportDefinitions"), scheduleId: v.optional(v.id("reportSchedules")),
    status: v.union(v.literal("queued"), v.literal("running"), v.literal("completed"), v.literal("failed")),
    snapshotJson: v.optional(v.string()), error: v.optional(v.string()), startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()), createdByUserId: v.string(), createdAt: v.number(),
  }).index("by_report_created", ["organizationId", "reportId", "createdAt"])
    .index("by_org_status_created", ["organizationId", "status", "createdAt"]),
};
