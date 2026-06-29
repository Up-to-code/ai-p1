import { defineTable } from "convex/server";
import { v } from "convex/values";

export const migrationTables = {
  migrationArchives: defineTable({
    organizationId: v.string(),
    migrationKey: v.string(),
    sourceTable: v.string(),
    sourceId: v.string(),
    payload: v.any(),
    archivedByUserId: v.string(),
    archivedAt: v.number(),
  })
    .index("by_migration", ["migrationKey", "archivedAt"])
    .index("by_source", ["sourceTable", "sourceId"])
    .index("by_organization_migration", ["organizationId", "migrationKey"]),
};
