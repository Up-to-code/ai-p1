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
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_updated", ["updatedAt"]),
  organizationSubscriptions: defineTable({
    organizationId: v.string(),
    planId: v.string(),
    status: v.union(
      v.literal("inactive"),
      v.literal("pending"),
      v.literal("active"),
      v.literal("past_due"),
      v.literal("canceled"),
    ),
    currentPeriodStartAt: v.optional(v.number()),
    currentPeriodEndAt: v.optional(v.number()),
    latestPaymentId: v.optional(v.id("tamaraPayments")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_status_period_end", ["status", "currentPeriodEndAt"]),
  tamaraPayments: defineTable({
    organizationId: v.string(),
    planId: v.string(),
    orderReferenceId: v.string(),
    orderNumber: v.string(),
    tamaraOrderId: v.optional(v.string()),
    tamaraCheckoutId: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("new"),
      v.literal("approved"),
      v.literal("authorised"),
      v.literal("captured"),
      v.literal("failed"),
      v.literal("canceled"),
      v.literal("expired"),
    ),
    checkoutUrl: v.optional(v.string()),
    failureReason: v.optional(v.string()),
    createdByUserId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    expiresAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_order_reference", ["orderReferenceId"])
    .index("by_tamara_order", ["tamaraOrderId"])
    .index("by_status_updated", ["status", "updatedAt"]),
  tamaraWebhookEvents: defineTable({
    eventKey: v.string(),
    eventType: v.string(),
    tamaraOrderId: v.optional(v.string()),
    orderReferenceId: v.optional(v.string()),
    status: v.union(v.literal("processed"), v.literal("duplicate"), v.literal("failed")),
    error: v.optional(v.string()),
    receivedAt: v.number(),
    processedAt: v.optional(v.number()),
  })
    .index("by_event_key", ["eventKey"])
    .index("by_tamara_order", ["tamaraOrderId"])
    .index("by_received", ["receivedAt"]),
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
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_created", ["createdAt"]),
  dataSecurityBackfillJobs: defineTable({
    target: v.union(
      v.literal("clientsDeletedFlag"),
      v.literal("projectsDeletedFlag"),
      v.literal("propertiesDeletedFlag"),
      v.literal("clientPii"),
      v.literal("webhookDeliveries"),
      v.literal("inboundEvents"),
      v.literal("agentMessages"),
      v.literal("agentMemorySummaries"),
      v.literal("agentMemoryFacts"),
    ),
    status: v.union(v.literal("queued"), v.literal("running"), v.literal("completed"), v.literal("failed"), v.literal("paused")),
    cursor: v.union(v.string(), v.null()),
    batchSize: v.number(),
    processedCount: v.number(),
    patchedCount: v.number(),
    failedCount: v.number(),
    lastError: v.optional(v.string()),
    startedBy: v.string(),
    startedAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_status_updated", ["status", "updatedAt"])
    .index("by_target_status", ["target", "status"]),
  dataSecurityBackfillFailures: defineTable({
    jobId: v.id("dataSecurityBackfillJobs"),
    target: v.string(),
    sourceId: v.string(),
    error: v.string(),
    createdAt: v.number(),
  })
    .index("by_job", ["jobId", "createdAt"])
    .index("by_target_created", ["target", "createdAt"]),
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
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("draft"), v.literal("revoked")),
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
    .index("by_key_id", ["keyId"])
    .index("by_status_updated", ["status", "updatedAt"]),
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
    .index("by_key_id", ["keyId"])
    .index("by_status_updated", ["status", "updatedAt"]),
  organizationPartnerConnections: defineTable({
    organizationId: v.string(),
    partnersAppId: v.string(),
    partnersClientId: v.string(),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("revoked")),
    scopes: v.array(v.string()),
    authorizedByUserId: v.string(),
    authorizedMemberId: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    lastVerifiedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    revokedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_app", ["organizationId", "partnersAppId"])
    .index("by_client_organization", ["partnersClientId", "organizationId"])
    .index("by_status_updated", ["status", "updatedAt"]),
  partnerWebhookEndpoints: defineTable({
    partnerAppId: v.string(),
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
    .index("by_partner_app_organization", ["partnerAppId", "organizationId"])
    .index("by_status_updated", ["status", "updatedAt"]),
  partnerWebhookDeliveries: defineTable({
    endpointId: v.id("partnerWebhookEndpoints"),
    partnerAppId: v.string(),
    organizationId: v.string(),
    eventId: v.string(),
    eventType: v.string(),
    payload: v.optional(v.any()),
    encryptedPayload: v.optional(v.string()),
    payloadRedacted: v.optional(v.boolean()),
    status: v.union(v.literal("pending"), v.literal("delivering"), v.literal("succeeded"), v.literal("failed")),
    attemptCount: v.number(),
    nextAttemptAt: v.optional(v.number()),
    lastAttemptAt: v.optional(v.number()),
    lastStatus: v.optional(v.number()),
    lastError: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_endpoint", ["endpointId"])
    .index("by_event_id", ["eventId"])
    .index("by_next_attempt", ["status", "nextAttemptAt"])
    .index("by_status_updated", ["status", "updatedAt"]),
  partnerInboundEvents: defineTable({
    organizationId: v.string(),
    partnerAppId: v.string(),
    eventId: v.string(),
    idempotencyKey: v.optional(v.string()),
    eventType: v.string(),
    occurredAt: v.number(),
    payload: v.optional(v.any()),
    encryptedPayload: v.optional(v.string()),
    payloadRedacted: v.optional(v.boolean()),
    status: v.union(v.literal("accepted"), v.literal("duplicate"), v.literal("failed")),
    error: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_partner_event", ["partnerAppId", "eventId"])
    .index("by_partner_idempotency", ["partnerAppId", "idempotencyKey"])
    .index("by_status_created", ["status", "createdAt"]),
  partnerExternalRefs: defineTable({
    organizationId: v.string(),
    partnerAppId: v.string(),
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
    .index("by_organization_resource", ["organizationId", "resourceType", "resourceId"])
    .index("by_updated", ["updatedAt"]),
  agentThreads: defineTable({
    organizationId: v.string(),
    title: v.string(),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastMessageAt: v.number(),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_updated", ["organizationId", "updatedAt"])
    .index("by_updated", ["updatedAt"]),
  agentMessages: defineTable({
    organizationId: v.string(),
    threadId: v.id("agentThreads"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system"), v.literal("tool")),
    content: v.string(),
    encryptedContent: v.optional(v.string()),
    contentRedacted: v.optional(v.boolean()),
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
    .index("by_thread", ["organizationId", "threadId", "startedAt"])
    .index("by_status_created", ["status", "startedAt"]),
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
    .index("by_run", ["organizationId", "runId", "createdAt"])
    .index("by_status_created", ["status", "createdAt"]),
  agentToolCalls: defineTable({
    organizationId: v.string(),
    threadId: v.id("agentThreads"),
    runId: v.id("agentRuns"),
    tool: v.string(),
    resource: v.string(),
    action: v.string(),
    status: v.union(
      v.literal("allowed"),
      v.literal("blocked"),
      v.literal("requires_confirmation"),
      v.literal("requires_admin_approval"),
      v.literal("failed"),
    ),
    inputPreview: v.optional(v.string()),
    outputPreview: v.optional(v.string()),
    encryptedInputPreview: v.optional(v.string()),
    encryptedOutputPreview: v.optional(v.string()),
    error: v.optional(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_run", ["organizationId", "runId", "createdAt"])
    .index("by_status_created", ["status", "createdAt"]),
  agentConfirmations: defineTable({
    organizationId: v.string(),
    threadId: v.optional(v.id("agentThreads")),
    runId: v.optional(v.id("agentRuns")),
    createdByUserId: v.string(),
    actorType: v.optional(v.union(v.literal("user"), v.literal("mcpConnection"))),
    actorMcpConnectionId: v.optional(v.string()),
    adapter: v.optional(v.union(v.literal("agent"), v.literal("mcp"))),
    tool: v.string(),
    resource: v.string(),
    action: v.string(),
    riskLevel: v.optional(v.union(
      v.literal("read"),
      v.literal("low_write"),
      v.literal("sensitive_write"),
      v.literal("destructive"),
      v.literal("admin"),
    )),
    approvalRequirement: v.optional(v.union(v.literal("none"), v.literal("user"), v.literal("admin"))),
    summary: v.string(),
    inputPreview: v.optional(v.string()),
    input: v.string(),
    encryptedInput: v.optional(v.string()),
    inputRedacted: v.optional(v.boolean()),
    requestContext: v.optional(v.any()),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("canceled"),
      v.literal("expired"),
      v.literal("executed"),
      v.literal("failed"),
    ),
    expiresAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    approvedAt: v.optional(v.number()),
    approvedByUserId: v.optional(v.string()),
    canceledAt: v.optional(v.number()),
    executedAt: v.optional(v.number()),
    failedAt: v.optional(v.number()),
    error: v.optional(v.string()),
  })
    .index("by_organization_status_expires", ["organizationId", "status", "expiresAt"])
    .index("by_run", ["organizationId", "runId", "createdAt"])
    .index("by_user_status", ["createdByUserId", "status", "updatedAt"]),
  agentMemorySummaries: defineTable({
    organizationId: v.string(),
    threadId: v.id("agentThreads"),
    summary: v.string(),
    encryptedSummary: v.optional(v.string()),
    summaryRedacted: v.optional(v.boolean()),
    messageCount: v.number(),
    updatedAt: v.number(),
  })
    .index("by_thread", ["organizationId", "threadId"])
    .index("by_updated", ["updatedAt"]),
  agentMemoryFacts: defineTable({
    organizationId: v.string(),
    threadId: v.optional(v.id("agentThreads")),
    fact: v.string(),
    encryptedFact: v.optional(v.string()),
    factRedacted: v.optional(v.boolean()),
    sourceMessageId: v.optional(v.id("agentMessages")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_thread", ["organizationId", "threadId"])
    .index("by_updated", ["updatedAt"]),
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
  })
    .index("by_user_id", ["userId"])
    .index("by_updated", ["updatedAt"]),
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
    averagePrice: v.optional(v.string()),
    projectPrices: v.optional(v.array(v.object({
      id: v.string(),
      label: v.string(),
      price: v.string(),
    }))),
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
    isDeleted: v.optional(v.boolean()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_status", ["organizationId", "status"])
    .index("by_organization_deleted_updated", ["organizationId", "isDeleted", "updatedAt"])
    .index("by_organization_deleted_status_updated", ["organizationId", "isDeleted", "status", "updatedAt"])
    .index("by_organization_updated", ["organizationId", "updatedAt"])
    .index("by_updated", ["updatedAt"]),
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
    isDeleted: v.optional(v.boolean()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_status", ["organizationId", "status"])
    .index("by_organization_deleted_updated", ["organizationId", "isDeleted", "updatedAt"])
    .index("by_organization_deleted_status_updated", ["organizationId", "isDeleted", "status", "updatedAt"])
    .index("by_organization_updated", ["organizationId", "updatedAt"])
    .index("by_project_id", ["projectId"])
    .index("by_updated", ["updatedAt"]),
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
    encryptedContact: v.optional(v.string()),
    encryptedPhone: v.optional(v.string()),
    encryptedNationality: v.optional(v.string()),
    encryptedBudget: v.optional(v.string()),
    piiEncryptedAt: v.optional(v.number()),
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
    isDeleted: v.optional(v.boolean()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_type", ["organizationId", "type"])
    .index("by_organization_stage", ["organizationId", "pipelineStage"])
    .index("by_organization_deleted_updated", ["organizationId", "isDeleted", "updatedAt"])
    .index("by_organization_deleted_type_updated", ["organizationId", "isDeleted", "type", "updatedAt"])
    .index("by_organization_updated", ["organizationId", "updatedAt"])
    .index("by_updated", ["updatedAt"]),
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
    .index("by_client_property", ["organizationId", "clientId", "propertyId"])
    .index("by_updated", ["updatedAt"]),
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
    .index("by_due", ["organizationId", "dueAt"])
    .index("by_updated", ["updatedAt"]),
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
    .index("by_start", ["organizationId", "startAt"])
    .index("by_updated", ["updatedAt"]),
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
    .index("by_key", ["key"])
    .index("by_updated", ["updatedAt"]),
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
    .index("by_organization_resource_name", ["organizationId", "resourceType", "resourceId", "name"])
    .index("by_updated", ["updatedAt"]),
});
