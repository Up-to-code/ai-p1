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
    actorType: v.optional(v.union(v.literal("user"), v.literal("mcpConnection"), v.literal("partnerApp"), v.literal("apiKey"))),
    actorMcpConnectionId: v.optional(v.string()),
    actorPartnerAppId: v.optional(v.string()),
    actorApiKeyId: v.optional(v.string()),
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
  organizationApiKeys: defineTable({
    organizationId: v.string(),
    keyId: v.string(),
    keyLast4: v.string(),
    name: v.string(),
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
    status: v.union(v.literal("active"), v.literal("revoked")),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastUsedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    usageCount: v.number(),
    quotaWindowStartedAt: v.optional(v.number()),
    quotaUsed: v.optional(v.number()),
    revokedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_key_id", ["keyId"]),
  partnerApps: defineTable({
    ownerUserId: v.string(),
    partnersAppId: v.optional(v.string()),
    partnersClientId: v.optional(v.string()),
    publisherName: v.optional(v.string()),
    oauthClientId: v.string(),
    clientType: v.optional(v.union(v.literal("public"), v.literal("confidential"))),
    callbackUrl: v.optional(v.string()),
    name: v.string(),
    description: v.string(),
    homepageUrl: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    redirectUris: v.array(v.string()),
    allowedScopes: v.array(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("suspended"),
    ),
    reviewNotes: v.optional(v.string()),
    reviewedByUserId: v.optional(v.string()),
    reviewedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner_user_id", ["ownerUserId"])
    .index("by_partners_app_id", ["partnersAppId"])
    .index("by_oauth_client_id", ["oauthClientId"])
    .index("by_status", ["status"]),
  organizationPartnerConnections: defineTable({
    organizationId: v.string(),
    partnerAppId: v.id("partnerApps"),
    oauthClientId: v.string(),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("revoked")),
    scopes: v.array(v.string()),
    authorizedByUserId: v.string(),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    revokedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_app", ["organizationId", "partnerAppId"])
    .index("by_oauth_client_organization", ["oauthClientId", "organizationId"]),
  partnerWebhookEndpoints: defineTable({
    partnerAppId: v.id("partnerApps"),
    organizationId: v.optional(v.string()),
    url: v.string(),
    signingSecret: v.string(),
    events: v.array(v.string()),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("revoked")),
    createdAt: v.number(),
    updatedAt: v.number(),
    revokedAt: v.optional(v.number()),
  })
    .index("by_partner_app", ["partnerAppId"])
    .index("by_organization", ["organizationId"])
    .index("by_partner_app_organization", ["partnerAppId", "organizationId"]),
  partnerWebhookDeliveries: defineTable({
    endpointId: v.id("partnerWebhookEndpoints"),
    partnerAppId: v.id("partnerApps"),
    organizationId: v.string(),
    eventId: v.string(),
    eventType: v.string(),
    payload: v.any(),
    status: v.union(v.literal("pending"), v.literal("delivering"), v.literal("succeeded"), v.literal("failed")),
    attemptCount: v.number(),
    nextAttemptAt: v.optional(v.number()),
    lastAttemptAt: v.optional(v.number()),
    lastStatus: v.optional(v.number()),
    lastError: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_endpoint", ["endpointId"])
    .index("by_event_id", ["eventId"])
    .index("by_next_attempt", ["status", "nextAttemptAt"]),
  partnerInboundEvents: defineTable({
    organizationId: v.string(),
    partnerAppId: v.id("partnerApps"),
    eventId: v.string(),
    idempotencyKey: v.optional(v.string()),
    eventType: v.string(),
    occurredAt: v.number(),
    payload: v.any(),
    status: v.union(v.literal("accepted"), v.literal("duplicate"), v.literal("failed")),
    error: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_partner_event", ["partnerAppId", "eventId"])
    .index("by_partner_idempotency", ["partnerAppId", "idempotencyKey"]),
  partnerExternalRefs: defineTable({
    organizationId: v.string(),
    partnerAppId: v.id("partnerApps"),
    resourceType: v.union(
      v.literal("client"),
      v.literal("property"),
      v.literal("project"),
      v.literal("calendar"),
      v.literal("task"),
      v.literal("media"),
    ),
    externalId: v.string(),
    resourceId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_partner_resource_external", ["partnerAppId", "resourceType", "externalId"])
    .index("by_organization_resource", ["organizationId", "resourceType", "resourceId"]),
  agentThreads: defineTable({
    organizationId: v.string(),
    title: v.string(),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastMessageAt: v.number(),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_updated", ["organizationId", "updatedAt"]),
  agentMessages: defineTable({
    organizationId: v.string(),
    threadId: v.id("agentThreads"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system"), v.literal("tool")),
    content: v.string(),
    runId: v.optional(v.id("agentRuns")),
    createdAt: v.number(),
  })
    .index("by_thread", ["organizationId", "threadId", "createdAt"]),
  agentRuns: defineTable({
    organizationId: v.string(),
    threadId: v.id("agentThreads"),
    status: v.union(v.literal("running"), v.literal("completed"), v.literal("failed"), v.literal("blocked")),
    model: v.string(),
    createdByUserId: v.string(),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    error: v.optional(v.string()),
  })
    .index("by_thread", ["organizationId", "threadId", "startedAt"]),
  agentRunSteps: defineTable({
    organizationId: v.string(),
    threadId: v.id("agentThreads"),
    runId: v.id("agentRuns"),
    phase: v.union(
      v.literal("understand"),
      v.literal("retrieve"),
      v.literal("plan"),
      v.literal("policy"),
      v.literal("execute"),
      v.literal("summarize"),
      v.literal("memory"),
    ),
    status: v.union(v.literal("started"), v.literal("completed"), v.literal("blocked"), v.literal("failed")),
    summary: v.string(),
    createdAt: v.number(),
  })
    .index("by_run", ["organizationId", "runId", "createdAt"]),
  agentToolCalls: defineTable({
    organizationId: v.string(),
    threadId: v.id("agentThreads"),
    runId: v.id("agentRuns"),
    tool: v.string(),
    resource: v.string(),
    action: v.string(),
    status: v.union(v.literal("allowed"), v.literal("blocked"), v.literal("failed")),
    inputPreview: v.optional(v.string()),
    outputPreview: v.optional(v.string()),
    error: v.optional(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_run", ["organizationId", "runId", "createdAt"]),
  agentMemorySummaries: defineTable({
    organizationId: v.string(),
    threadId: v.id("agentThreads"),
    summary: v.string(),
    messageCount: v.number(),
    updatedAt: v.number(),
  })
    .index("by_thread", ["organizationId", "threadId"]),
  agentMemoryFacts: defineTable({
    organizationId: v.string(),
    threadId: v.optional(v.id("agentThreads")),
    fact: v.string(),
    sourceMessageId: v.optional(v.id("agentMessages")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_thread", ["organizationId", "threadId"]),
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
    .index("by_organization_status_expires", ["organizationId", "status", "expiresAt"])
    .index("by_organization_role_status_expires", ["organizationId", "role", "status", "expiresAt"])
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
    visibility: v.optional(v.union(v.literal("private"), v.literal("public"))),
    syncState: v.union(v.literal("draft"), v.literal("blocked"), v.literal("synced")),
    units: v.number(),
    priceRange: v.string(),
    regaAuthorizationNo: v.optional(v.string()),
    regaExpiresAt: v.optional(v.string()),
    planNumber: v.optional(v.string()),
    plotNumber: v.optional(v.string()),
    postalIdentity: v.optional(v.string()),
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
    visibility: v.optional(v.union(v.literal("private"), v.literal("public"))),
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
    visibility: v.optional(v.union(v.literal("private"), v.literal("public"))),
    pipelineStage: v.union(
      v.literal("new"),
      v.literal("qualified"),
      v.literal("viewing"),
      v.literal("negotiation"),
      v.literal("closed"),
    ),
    pipelineOrder: v.optional(v.number()),
    priority: v.union(v.literal("normal"), v.literal("high"), v.literal("urgent")),
    nextAction: v.string(),
    issue: v.optional(v.string()),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_type", ["organizationId", "type"])
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
    visibility: v.optional(v.union(v.literal("private"), v.literal("public"))),
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
      v.literal("visit"),
      v.literal("call"),
      v.literal("meeting"),
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
    customFields: v.optional(v.array(v.object({
      label: v.string(),
      value: v.string(),
    }))),
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
    folderId: v.optional(v.id("mediaFolders")),
    shareVisibility: v.optional(v.union(v.literal("private"), v.literal("public"))),
    publicEnabledAt: v.optional(v.number()),
    publicDisabledAt: v.optional(v.number()),
    sortOrder: v.number(),
    isCover: v.boolean(),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_resource", ["organizationId", "resourceType", "resourceId"])
    .index("by_key", ["key"]),
  mediaFolders: defineTable({
    organizationId: v.string(),
    resourceType: v.union(
      v.literal("project"),
      v.literal("property"),
      v.literal("client"),
      v.literal("calendarEvent"),
      v.literal("task"),
    ),
    resourceId: v.string(),
    name: v.string(),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization_resource", ["organizationId", "resourceType", "resourceId"])
    .index("by_organization_resource_name", ["organizationId", "resourceType", "resourceId", "name"]),
});
