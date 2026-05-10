import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// App tables are organization-scoped so user identity never owns business data directly.
export default defineSchema({
  organizations: defineTable({
    organizationId: v.string(),
    name: v.string(),
    legalName: v.string(),
    type: v.string(),
    email: v.string(),
    phone: v.string(),
    website: v.string(),
    address: v.string(),
    updatedAt: v.number(),
  }).index("by_organization_id", ["organizationId"]),
  organizationAuditEvents: defineTable({
    organizationId: v.string(),
    actorUserId: v.string(),
    action: v.string(),
    target: v.string(),
    summary: v.string(),
    createdAt: v.number(),
  }).index("by_organization_id", ["organizationId"]),
  organizationInviteLinks: defineTable({
    organizationId: v.string(),
    role: v.string(),
    tokenHash: v.string(),
    status: v.union(v.literal("pending"), v.literal("used"), v.literal("canceled")),
    createdByUserId: v.string(),
    expiresAt: v.number(),
    usedAt: v.optional(v.number()),
    usedByUserId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_token_hash", ["tokenHash"]),
  userProfiles: defineTable({
    userId: v.string(),
    avatarUrl: v.optional(v.string()),
    avatarKey: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_user_id", ["userId"]),
  projects: defineTable({
    organizationId: v.string(),
    name: v.string(),
    reference: v.string(),
    developer: v.string(),
    city: v.string(),
    area: v.string(),
    type: v.string(),
    unitTypes: v.optional(v.array(v.string())),
    status: v.union(v.literal("draft"), v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    syncState: v.union(v.literal("draft"), v.literal("blocked"), v.literal("synced")),
    units: v.number(),
    priceRange: v.string(),
    description: v.string(),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_status", ["organizationId", "status"]),
  propertyUnits: defineTable({
    organizationId: v.string(),
    title: v.string(),
    reference: v.string(),
    projectId: v.optional(v.id("projects")),
    project: v.string(),
    city: v.string(),
    type: v.string(),
    status: v.union(v.literal("available"), v.literal("sold"), v.literal("reserved"), v.literal("pending"), v.literal("draft")),
    purpose: v.union(v.literal("sale"), v.literal("rent")),
    price: v.string(),
    area: v.string(),
    bedrooms: v.number(),
    bathrooms: v.number(),
    description: v.string(),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_status", ["organizationId", "status"])
    .index("by_project_id", ["projectId"]),
  mediaAssets: defineTable({
    organizationId: v.string(),
    key: v.string(),
    url: v.string(),
    name: v.string(),
    mimeType: v.string(),
    size: v.number(),
    kind: v.union(v.literal("image"), v.literal("video"), v.literal("document")),
    resourceType: v.union(v.literal("project"), v.literal("property")),
    resourceId: v.string(),
    sortOrder: v.number(),
    isCover: v.boolean(),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_resource", ["organizationId", "resourceType", "resourceId"])
    .index("by_key", ["key"]),
});
