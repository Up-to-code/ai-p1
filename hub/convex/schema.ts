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
    actorType: v.optional(v.union(v.literal("user"), v.literal("mcpConnection"))),
    actorMcpConnectionId: v.optional(v.string()),
    action: v.string(),
    target: v.string(),
    summary: v.string(),
    createdAt: v.number(),
  }).index("by_organization_id", ["organizationId"]),
  organizationMcpConnections: defineTable({
    organizationId: v.string(),
    publicId: v.string(),
    keyId: v.string(),
    keyLast4: v.string(),
    name: v.string(),
    instructions: v.optional(v.string()),
    permissions: v.array(v.object({
      resource: v.union(
        v.literal("organization"),
        v.literal("client"),
        v.literal("property"),
        v.literal("project"),
        v.literal("calendar"),
        v.literal("task"),
        v.literal("media"),
      ),
      actions: v.array(v.union(
        v.literal("read"),
        v.literal("create"),
        v.literal("update"),
        v.literal("delete"),
      )),
    })),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("revoked")),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastUsedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    usageCount: v.number(),
    rateLimitWindowStartedAt: v.optional(v.number()),
    rateLimitCount: v.optional(v.number()),
    revokedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_public_id", ["publicId"])
    .index("by_key_id", ["keyId"]),
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
    .index("by_organization_status", ["organizationId", "status"])
    .index("by_organization_updated", ["organizationId", "updatedAt"]),
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
    .index("by_organization_updated", ["organizationId", "updatedAt"])
    .index("by_project_id", ["projectId"]),
  clients: defineTable({
    organizationId: v.string(),
    name: v.string(),
    type: v.union(v.literal("Buyer"), v.literal("Tenant"), v.literal("Investor"), v.literal("Broker")),
    contact: v.string(),
    phone: v.string(),
    age: v.number(),
    nationality: v.string(),
    generation: v.string(),
    budget: v.string(),
    propertyInterest: v.string(),
    status: v.union(v.literal("active"), v.literal("inactive")),
    pipelineStage: v.union(
      v.literal("new"),
      v.literal("qualified"),
      v.literal("viewing"),
      v.literal("negotiation"),
      v.literal("closed"),
    ),
    priority: v.union(v.literal("normal"), v.literal("high"), v.literal("urgent")),
    nextAction: v.string(),
    issue: v.optional(v.string()),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_stage", ["organizationId", "pipelineStage"])
    .index("by_organization_updated", ["organizationId", "updatedAt"]),
  clientUnitLinks: defineTable({
    organizationId: v.string(),
    clientId: v.id("clients"),
    propertyId: v.id("propertyUnits"),
    status: v.union(
      v.literal("interested"),
      v.literal("shortlisted"),
      v.literal("viewing"),
      v.literal("offer"),
      v.literal("rejected"),
    ),
    notes: v.optional(v.string()),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_client", ["organizationId", "clientId"])
    .index("by_property", ["organizationId", "propertyId"])
    .index("by_client_property", ["organizationId", "clientId", "propertyId"]),
  clientTasks: defineTable({
    organizationId: v.string(),
    clientId: v.id("clients"),
    title: v.string(),
    status: v.union(v.literal("open"), v.literal("done"), v.literal("canceled")),
    priority: v.union(v.literal("normal"), v.literal("high"), v.literal("urgent")),
    dueAt: v.optional(v.number()),
    propertyId: v.optional(v.id("propertyUnits")),
    projectId: v.optional(v.id("projects")),
    calendarEventId: v.optional(v.id("calendarEvents")),
    notes: v.optional(v.string()),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_client", ["organizationId", "clientId"])
    .index("by_client_status", ["organizationId", "clientId", "status"])
    .index("by_due", ["organizationId", "dueAt"]),
  calendarEvents: defineTable({
    organizationId: v.string(),
    title: v.string(),
    owner: v.string(),
    startAt: v.number(),
    endAt: v.optional(v.number()),
    type: v.union(
      v.literal("client-visit"),
      v.literal("site-viewing"),
      v.literal("appointment"),
      v.literal("signing"),
      v.literal("follow-up"),
      v.literal("handover"),
      v.literal("audit"),
      v.literal("custom"),
    ),
    status: v.union(v.literal("confirmed"), v.literal("pending"), v.literal("draft")),
    clientId: v.optional(v.id("clients")),
    propertyId: v.optional(v.id("propertyUnits")),
    projectId: v.optional(v.id("projects")),
    taskId: v.optional(v.id("clientTasks")),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_client", ["organizationId", "clientId"])
    .index("by_start", ["organizationId", "startAt"]),
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
      v.literal("property"),
      v.literal("client"),
      v.literal("calendarEvent"),
      v.literal("task"),
    ),
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
