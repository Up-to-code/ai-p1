import { defineTable } from "convex/server";
import { v } from "convex/values";

export const mediaTables = {
  mediaAssets: defineTable({
    organizationId: v.string(),
    key: v.string(),
    url: v.string(),
    name: v.string(),
    mimeType: v.string(),
    size: v.number(),
    kind: v.union(v.literal("image"), v.literal("video"), v.literal("document")),
    resourceType: v.union(
      v.literal("project"),
      v.literal("client"),
      v.literal("calendarEvent"),
      v.literal("task"),
      v.literal("space"),
    ),
    resourceId: v.string(),
    folderId: v.optional(v.id("mediaFolders")),
    shareVisibility: v.optional(v.union(
      v.literal("private"),
      v.literal("public"),
      v.literal("team"),
      v.literal("owner"),
      v.literal("member"),
    )),
    publicEnabledAt: v.optional(v.number()),
    publicDisabledAt: v.optional(v.number()),
    sortOrder: v.number(),
    isCover: v.boolean(),
    malwareScanStatus: v.optional(v.union(v.literal("unverified"), v.literal("pending"), v.literal("clean"), v.literal("infected"), v.literal("failed"))),
    malwareScanner: v.optional(v.string()),
    malwareScannerVersion: v.optional(v.string()),
    malwareScannedAt: v.optional(v.number()),
    quarantinedAt: v.optional(v.number()),
    spaceId: v.optional(v.string()),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_resource", ["organizationId", "resourceType", "resourceId"])
    .index("by_organization_space", ["organizationId", "spaceId"])
    .index("by_key", ["key"])
    .index("by_security_status", ["organizationId", "malwareScanStatus", "updatedAt"])
    .index("by_updated", ["updatedAt"]),

  mediaFolders: defineTable({
    organizationId: v.string(),
    resourceType: v.union(
      v.literal("project"),
      v.literal("client"),
      v.literal("calendarEvent"),
      v.literal("task"),
      v.literal("space"),
    ),
    resourceId: v.string(),
    name: v.string(),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization_resource", ["organizationId", "resourceType", "resourceId"])
    .index("by_organization_resource_name", ["organizationId", "resourceType", "resourceId", "name"])
    .index("by_updated", ["updatedAt"]),
};
