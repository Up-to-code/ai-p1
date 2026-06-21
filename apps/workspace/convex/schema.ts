import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const workOsRecordResourceValidator = v.union(
  v.literal("client"),
  v.literal("deal"),
  v.literal("opportunity"),
  v.literal("project"),
  v.literal("task"),
  v.literal("calendarEvent"),
);

const workOsCustomFieldTypeValidator = v.union(
  v.literal("text"),
  v.literal("longText"),
  v.literal("number"),
  v.literal("currency"),
  v.literal("date"),
  v.literal("dateTime"),
  v.literal("select"),
  v.literal("multiSelect"),
  v.literal("boolean"),
  v.literal("user"),
  v.literal("url"),
);

const workOsCustomFieldOptionValidator = v.object({
  id: v.string(),
  label: v.string(),
  color: v.optional(v.string()),
  order: v.number(),
  archivedAt: v.optional(v.number()),
});

const workOsCustomFieldDefinitionValidator = v.object({
  id: v.optional(v.string()),
  organizationId: v.optional(v.string()),
  workspaceId: v.optional(v.string()),
  templateId: v.optional(v.string()),
  key: v.string(),
  label: v.string(),
  description: v.optional(v.string()),
  type: workOsCustomFieldTypeValidator,
  required: v.boolean(),
  options: v.optional(v.array(workOsCustomFieldOptionValidator)),
  appliesTo: v.array(workOsRecordResourceValidator),
  defaultValue: v.optional(v.any()),
  display: v.optional(v.object({
    formSection: v.optional(v.string()),
    tableVisible: v.boolean(),
    boardVisible: v.boolean(),
    detailVisible: v.boolean(),
    requiredOnCreate: v.boolean(),
  })),
  order: v.optional(v.number()),
  archivedAt: v.optional(v.number()),
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
});

const workOsCustomFieldValueValidator = v.object({
  fieldDefinitionId: v.optional(v.string()),
  fieldKey: v.string(),
  recordType: v.optional(workOsRecordResourceValidator),
  recordId: v.optional(v.string()),
  type: workOsCustomFieldTypeValidator,
  textValue: v.optional(v.string()),
  numberValue: v.optional(v.number()),
  currencyValue: v.optional(v.number()),
  booleanValue: v.optional(v.boolean()),
  dateValue: v.optional(v.string()),
  dateTimeValue: v.optional(v.string()),
  selectValue: v.optional(v.string()),
  multiSelectValue: v.optional(v.array(v.string())),
  userValue: v.optional(v.string()),
  urlValue: v.optional(v.string()),
});

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
    logo: v.optional(v.string()),
    // Temporary tolerance for production rows created during the reverted WorkOS auth attempt.
    workosOrganizationId: v.optional(v.string()),
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
    latestPaymentId: v.optional(v.id("dodoPayments")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_status_period_end", ["status", "currentPeriodEndAt"]),
  organizationCreditBalances: defineTable({
    organizationId: v.string(),
    planId: v.string(),
    subscriptionCreditsGranted: v.number(),
    subscriptionCreditsUsed: v.number(),
    addOnCreditsGranted: v.number(),
    addOnCreditsUsed: v.number(),
    currentPeriodStartAt: v.optional(v.number()),
    currentPeriodEndAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_period_end", ["currentPeriodEndAt"]),
  organizationCreditLedger: defineTable({
    organizationId: v.string(),
    kind: v.union(
      v.literal("grant"),
      v.literal("top_up"),
      v.literal("usage"),
      v.literal("adjustment"),
    ),
    meter: v.optional(v.union(
      v.literal("ai_chat"),
      v.literal("agent_link_call"),
      v.literal("api_key_call"),
      v.literal("app_access"),
    )),
    sourceType: v.optional(v.string()),
    sourceId: v.optional(v.string()),
    agentRunId: v.optional(v.id("agentRuns")),
    modelId: v.optional(v.string()),
    promptTokens: v.optional(v.number()),
    completionTokens: v.optional(v.number()),
    toolCallCount: v.optional(v.number()),
    calculatedCredits: v.number(),
    requestedCredits: v.number(),
    subscriptionCreditsDelta: v.number(),
    addOnCreditsDelta: v.number(),
    subscriptionCreditsUsed: v.number(),
    addOnCreditsUsed: v.number(),
    balanceAfterSubscriptionCredits: v.number(),
    balanceAfterAddOnCredits: v.number(),
    billingPeriodStartAt: v.optional(v.number()),
    billingPeriodEndAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_organization_created", ["organizationId", "createdAt"])
    .index("by_organization_kind_created", ["organizationId", "kind", "createdAt"])
    .index("by_agent_run", ["organizationId", "agentRunId"]),
  dodoPayments: defineTable({
    organizationId: v.string(),
    planId: v.string(),
    orderId: v.string(),
    dodoPaymentId: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    seats: v.optional(v.number()),
    status: v.union(
      v.literal("pending"),
      v.literal("succeeded"),
      v.literal("failed"),
      v.literal("canceled"),
    ),
    checkoutUrl: v.optional(v.string()),
    failureReason: v.optional(v.string()),
    createdByUserId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    expiresAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_order_id", ["orderId"])
    .index("by_dodo_payment", ["dodoPaymentId"])
    .index("by_status_updated", ["status", "updatedAt"]),
  dodoWebhookEvents: defineTable({
    eventKey: v.string(),
    eventType: v.string(),
    dodoPaymentId: v.optional(v.string()),
    orderId: v.optional(v.string()),
    status: v.union(v.literal("processed"), v.literal("duplicate"), v.literal("failed")),
    error: v.optional(v.string()),
    receivedAt: v.number(),
    processedAt: v.optional(v.number()),
  })
    .index("by_event_key", ["eventKey"])
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
        v.literal("project"),
        v.literal("deal"),
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
    principalType: v.optional(v.union(v.literal("user"), v.literal("organization"))),
    principalUserId: v.optional(v.string()),
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
    .index("by_organization_creator_updated", ["organizationId", "createdByUserId", "updatedAt"])
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
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.optional(v.string()),
    language: v.optional(v.union(v.literal("en"), v.literal("ar"))),
    timezone: v.optional(v.string()),
    notifications: v.optional(v.object({
      product: v.boolean(),
      approvals: v.boolean(),
      billing: v.boolean(),
      security: v.boolean(),
    })),
    avatarUrl: v.optional(v.string()),
    avatarKey: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_updated", ["updatedAt"]),
  notificationDevices: defineTable({
    userId: v.string(),
    installationId: v.string(),
    recipientKey: v.string(),
    platform: v.string(),
    appVersion: v.optional(v.string()),
    tokenLast4: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("revoked")),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastRegisteredAt: v.number(),
    revokedAt: v.optional(v.number()),
  })
    .index("by_user_id", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_recipient_key", ["recipientKey"])
    .index("by_installation", ["userId", "installationId"]),
  notificationPreferences: defineTable({
    organizationId: v.string(),
    principalType: v.union(v.literal("user"), v.literal("organization")),
    principalKey: v.string(),
    principalUserId: v.optional(v.string()),
    enabled: v.boolean(),
    categories: v.object({
      calendar: v.boolean(),
      task: v.boolean(),
      manual: v.boolean(),
      organization: v.boolean(),
    }),
    quietHours: v.optional(v.object({
      enabled: v.boolean(),
      startMinute: v.number(),
      endMinute: v.number(),
      timezone: v.string(),
    })),
    reminderRules: v.array(v.object({
      id: v.string(),
      sourceType: v.union(v.literal("calendarEvent"), v.literal("task"), v.literal("manualSchedule")),
      trigger: v.union(v.literal("before_start"), v.literal("at_start"), v.literal("after_start"), v.literal("after_complete")),
      offsetMinutes: v.number(),
      enabled: v.boolean(),
    })),
    createdByUserId: v.string(),
    updatedByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization_principal", ["organizationId", "principalKey"])
    .index("by_organization_type", ["organizationId", "principalType"]),
  notificationSchedules: defineTable({
    organizationId: v.string(),
    ownerUserId: v.string(),
    title: v.string(),
    body: v.string(),
    category: v.union(v.literal("calendar"), v.literal("task"), v.literal("manual"), v.literal("organization")),
    scheduledAt: v.number(),
    timezone: v.optional(v.string()),
    recurrence: v.optional(v.object({
      frequency: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
      interval: v.number(),
      untilAt: v.optional(v.number()),
    })),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("canceled")),
    createdByUserId: v.string(),
    updatedByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    canceledAt: v.optional(v.number()),
  })
    .index("by_organization_owner", ["organizationId", "ownerUserId"])
    .index("by_organization_status", ["organizationId", "status"])
    .index("by_status_scheduled", ["status", "scheduledAt"]),
  notificationJobs: defineTable({
    organizationId: v.string(),
    recipientUserId: v.string(),
    sourceType: v.union(v.literal("calendarEvent"), v.literal("task"), v.literal("manualSchedule")),
    sourceId: v.string(),
    trigger: v.union(v.literal("before_start"), v.literal("at_start"), v.literal("after_start"), v.literal("after_complete"), v.literal("manual")),
    category: v.union(v.literal("calendar"), v.literal("task"), v.literal("manual"), v.literal("organization")),
    scheduledAt: v.number(),
    state: v.union(
      v.literal("queued"),
      v.literal("delivered"),
      v.literal("skipped"),
      v.literal("failed"),
      v.literal("canceled"),
    ),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.object({
      url: v.optional(v.string()),
      organizationId: v.optional(v.string()),
      sourceType: v.optional(v.string()),
      sourceId: v.optional(v.string()),
    })),
    componentNotificationId: v.optional(v.string()),
    error: v.optional(v.string()),
    scheduledFunctionId: v.optional(v.id("_scheduled_functions")),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deliveredAt: v.optional(v.number()),
    skippedAt: v.optional(v.number()),
    failedAt: v.optional(v.number()),
    canceledAt: v.optional(v.number()),
  })
    .index("by_recipient_state_scheduled", ["recipientUserId", "state", "scheduledAt"])
    .index("by_organization_state_scheduled", ["organizationId", "state", "scheduledAt"])
    .index("by_source_state", ["organizationId", "sourceType", "sourceId", "state"])
    .index("by_state_scheduled", ["state", "scheduledAt"]),
  projects: defineTable({
    organizationId: v.string(),
    name: v.string(),
    clientId: v.optional(v.id("clients")),
    opportunityId: v.optional(v.id("opportunities")),
    ownerUserId: v.string(),
    teamMemberIds: v.optional(v.array(v.string())),
    status: v.union(
      v.literal("planned"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("archived"),
    ),
    health: v.union(v.literal("onTrack"), v.literal("atRisk"), v.literal("blocked")),
    visibility: v.optional(v.union(v.literal("private"), v.literal("team"), v.literal("workspace"))),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    budget: v.optional(v.number()),
    currency: v.optional(v.string()),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    customFields: v.optional(v.array(workOsCustomFieldValueValidator)),
    isStrict: v.optional(v.boolean()),
    isRollupEnabled: v.optional(v.boolean()),
    templateId: v.optional(v.string()),
    customTabs: v.optional(v.array(v.string())),
    progress: v.optional(v.number()),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
    isDeleted: v.optional(v.boolean()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_status", ["organizationId", "status"])
    .index("by_organization_health", ["organizationId", "health"])
    .index("by_organization_owner", ["organizationId", "ownerUserId"])
    .index("by_organization_deleted_updated", ["organizationId", "isDeleted", "updatedAt"])
    .index("by_organization_deleted_status_updated", ["organizationId", "isDeleted", "status", "updatedAt"])
    .index("by_client", ["organizationId", "clientId"])
    .index("by_opportunity", ["organizationId", "opportunityId"])
    .index("by_organization_updated", ["organizationId", "updatedAt"])
    .index("by_updated", ["updatedAt"]),
  clients: defineTable({
    organizationId: v.string(),
    name: v.string(),
    type: v.union(v.literal("person"), v.literal("organization")),
    ownerUserId: v.string(),
    status: v.union(v.literal("new"), v.literal("active"), v.literal("nurture"), v.literal("inactive"), v.literal("archived")),
    pipelineStage: v.optional(v.union(
      v.literal("new"),
      v.literal("qualified"),
      v.literal("review"),
      v.literal("negotiation"),
      v.literal("closed"),
    )),
    pipelineOrder: v.optional(v.number()),
    source: v.string(),
    company: v.optional(v.string()),
    contactName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    customFields: v.optional(v.array(workOsCustomFieldValueValidator)),
    encryptedEmail: v.optional(v.string()),
    encryptedPhone: v.optional(v.string()),
    piiEncryptedAt: v.optional(v.number()),
    visibility: v.optional(v.union(v.literal("private"), v.literal("team"), v.literal("workspace"))),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
    isDeleted: v.optional(v.boolean()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_type", ["organizationId", "type"])
    .index("by_organization_status", ["organizationId", "status"])
    .index("by_organization_owner", ["organizationId", "ownerUserId"])
    .index("by_organization_deleted_updated", ["organizationId", "isDeleted", "updatedAt"])
    .index("by_organization_deleted_type_updated", ["organizationId", "isDeleted", "type", "updatedAt"])
    .index("by_organization_updated", ["organizationId", "updatedAt"])
    .index("by_updated", ["updatedAt"]),
  opportunities: defineTable({
    organizationId: v.string(),
    title: v.string(),
    clientId: v.optional(v.id("clients")),
    projectId: v.optional(v.id("projects")),
    stage: v.union(
      v.literal("new"),
      v.literal("qualified"),
      v.literal("proposal"),
      v.literal("negotiation"),
      v.literal("won"),
      v.literal("lost"),
    ),
    status: v.union(
      v.literal("open"),
      v.literal("won"),
      v.literal("lost"),
      v.literal("paused"),
    ),
    value: v.optional(v.number()),
    currency: v.optional(v.string()),
    source: v.optional(v.string()),
    priority: v.union(v.literal("low"), v.literal("normal"), v.literal("high"), v.literal("urgent")),
    closeDate: v.optional(v.string()),
    nextStep: v.optional(v.string()),
    ownerUserId: v.string(),
    tags: v.optional(v.array(v.string())),
    customFields: v.optional(v.array(workOsCustomFieldValueValidator)),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    closedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
    isDeleted: v.optional(v.boolean()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_stage", ["organizationId", "stage"])
    .index("by_organization_status", ["organizationId", "status"])
    .index("by_organization_owner", ["organizationId", "ownerUserId"])
    .index("by_organization_deleted_updated", ["organizationId", "isDeleted", "updatedAt"])
    .index("by_client", ["organizationId", "clientId"])
    .index("by_project", ["organizationId", "projectId"])
    .index("by_updated", ["updatedAt"]),
  deals: defineTable({
    organizationId: v.string(),
    title: v.string(),
    clientId: v.optional(v.id("clients")),
    projectId: v.optional(v.id("projects")),
    stage: v.union(
      v.literal("lead"),
      v.literal("qualified"),
      v.literal("proposal_sent"),
      v.literal("contract_sent"),
      v.literal("won"),
      v.literal("lost"),
    ),
    status: v.union(
      v.literal("open"),
      v.literal("won"),
      v.literal("lost"),
      v.literal("paused"),
    ),
    value: v.optional(v.number()),
    currency: v.optional(v.string()),
    dealThinking: v.optional(v.string()),
    source: v.optional(v.string()),
    priority: v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent"),
    ),
    closeDate: v.optional(v.string()),
    nextStep: v.optional(v.string()),
    ownerUserId: v.string(),
    tags: v.optional(v.array(v.string())),
    customFields: v.optional(v.array(workOsCustomFieldValueValidator)),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    closedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
    isDeleted: v.optional(v.boolean()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_stage", ["organizationId", "stage"])
    .index("by_organization_status", ["organizationId", "status"])
    .index("by_organization_deleted_updated", ["organizationId", "isDeleted", "updatedAt"])
    .index("by_client", ["organizationId", "clientId"])
    .index("by_project", ["organizationId", "projectId"])
    .index("by_updated", ["updatedAt"]),
  customFieldDefinitions: defineTable({
    organizationId: v.string(),
    workspaceId: v.optional(v.string()),
    templateId: v.optional(v.string()),
    key: v.string(),
    label: v.string(),
    description: v.optional(v.string()),
    type: workOsCustomFieldTypeValidator,
    required: v.boolean(),
    options: v.optional(v.array(workOsCustomFieldOptionValidator)),
    appliesTo: v.array(workOsRecordResourceValidator),
    defaultValue: v.optional(v.any()),
    display: v.optional(v.object({
      formSection: v.optional(v.string()),
      tableVisible: v.boolean(),
      boardVisible: v.boolean(),
      detailVisible: v.boolean(),
      requiredOnCreate: v.boolean(),
    })),
    order: v.number(),
    archivedAt: v.optional(v.number()),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_key", ["organizationId", "key"])
    .index("by_organization_template", ["organizationId", "templateId"])
    .index("by_updated", ["updatedAt"]),
  customFieldValues: defineTable({
    organizationId: v.string(),
    fieldDefinitionId: v.id("customFieldDefinitions"),
    fieldKey: v.string(),
    recordType: workOsRecordResourceValidator,
    recordId: v.string(),
    type: workOsCustomFieldTypeValidator,
    textValue: v.optional(v.string()),
    numberValue: v.optional(v.number()),
    currencyValue: v.optional(v.number()),
    booleanValue: v.optional(v.boolean()),
    dateValue: v.optional(v.string()),
    dateTimeValue: v.optional(v.string()),
    selectValue: v.optional(v.string()),
    multiSelectValue: v.optional(v.array(v.string())),
    userValue: v.optional(v.string()),
    urlValue: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization_record", ["organizationId", "recordType", "recordId"])
    .index("by_organization_field", ["organizationId", "fieldDefinitionId"])
    .index("by_organization_field_record", ["organizationId", "fieldDefinitionId", "recordType", "recordId"])
    .index("by_updated", ["updatedAt"]),
  recordLinks: defineTable({
    organizationId: v.string(),
    linkType: v.union(
      v.literal("related"),
      v.literal("owns"),
      v.literal("dependsOn"),
      v.literal("blocks"),
      v.literal("createdFrom"),
      v.literal("attachedTo"),
    ),
    sourceRecordType: workOsRecordResourceValidator,
    sourceRecordId: v.string(),
    targetRecordType: workOsRecordResourceValidator,
    targetRecordId: v.string(),
    label: v.optional(v.string()),
    createdByUserId: v.string(),
    createdAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_source", ["organizationId", "sourceRecordType", "sourceRecordId"])
    .index("by_target", ["organizationId", "targetRecordType", "targetRecordId"])
    .index("by_type", ["organizationId", "linkType"]),
  workspaceTemplates: defineTable({
    organizationId: v.optional(v.string()),
    key: v.union(
      v.literal("custom"),
      v.literal("sales_crm"),
      v.literal("agency_marketing"),
      v.literal("consulting_services"),
      v.literal("operations"),
      v.literal("real_estate_legacy"),
    ),
    name: v.string(),
    category: v.string(),
    description: v.optional(v.string()),
    version: v.string(),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("archived")),
    recordLabels: v.optional(v.any()),
    recordStatuses: v.optional(v.any()),
    opportunityStages: v.optional(v.array(v.string())),
    customFieldDefinitions: v.optional(v.array(workOsCustomFieldDefinitionValidator)),
    automationRecipes: v.optional(v.array(v.string())),
    views: v.optional(v.array(v.object({
      recordType: workOsRecordResourceValidator,
      type: v.union(v.literal("table"), v.literal("board"), v.literal("calendar"), v.literal("detail")),
      name: v.string(),
    }))),
    createdByUserId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_key", ["key"])
    .index("by_organization_key", ["organizationId", "key"])
    .index("by_updated", ["updatedAt"]),
  automations: defineTable({
    organizationId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    enabled: v.boolean(),
    trigger: v.any(),
    conditions: v.optional(v.array(v.any())),
    conditionMode: v.optional(v.union(v.literal("all"), v.literal("any"))),
    actions: v.array(v.any()),
    ownerUserId: v.optional(v.string()),
    lastRunAt: v.optional(v.number()),
    lastRunStatus: v.optional(v.union(v.literal("success"), v.literal("failed"), v.literal("skipped"))),
    lastRunSummary: v.optional(v.string()),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_enabled", ["organizationId", "enabled"])
    .index("by_organization_owner", ["organizationId", "ownerUserId"])
    .index("by_updated", ["updatedAt"]),
  tasks: defineTable({
    organizationId: v.string(),
    title: v.string(),
    status: v.union(v.literal("todo"), v.literal("inProgress"), v.literal("waiting"), v.literal("done"), v.literal("canceled")),
    pipelineOrder: v.optional(v.number()),
    priority: v.union(v.literal("low"), v.literal("normal"), v.literal("high"), v.literal("urgent")),
    assigneeUserId: v.optional(v.string()),
    clientId: v.optional(v.string()),
    projectId: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    description: v.optional(v.string()),
    checklist: v.optional(v.array(v.object({
      id: v.string(),
      title: v.string(),
      done: v.boolean(),
    }))),
    tags: v.optional(v.array(v.string())),
    customFields: v.optional(v.array(workOsCustomFieldValueValidator)),
    visibility: v.optional(v.union(v.literal("private"), v.literal("team"), v.literal("workspace"))),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_status", ["organizationId", "status"])
    .index("by_organization_assignee", ["organizationId", "assigneeUserId"])
    .index("by_organization_client", ["organizationId", "clientId"])
    .index("by_organization_project", ["organizationId", "projectId"])
    .index("by_due", ["organizationId", "dueDate"])
    .index("by_updated", ["updatedAt"]),
  calendarEvents: defineTable({
    organizationId: v.string(),
    title: v.string(),
    ownerUserId: v.optional(v.string()),
    clientId: v.optional(v.string()),
    projectId: v.optional(v.string()),
    taskId: v.optional(v.string()),
    startAt: v.number(),
    endAt: v.number(),
    type: v.union(
      v.literal("meeting"),
      v.literal("deadline"),
      v.literal("reminder"),
      v.literal("milestone"),
      v.literal("focusBlock"),
    ),
    status: v.union(v.literal("confirmed"), v.literal("pending"), v.literal("draft")),
    attendeeUserIds: v.optional(v.array(v.string())),
    externalAttendees: v.optional(v.array(v.string())),
    location: v.optional(v.string()),
    meetingUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    customFields: v.optional(v.array(workOsCustomFieldValueValidator)),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_owner", ["organizationId", "ownerUserId"])
    .index("by_organization_project", ["organizationId", "projectId"])
    .index("by_organization_client", ["organizationId", "clientId"])
    .index("by_start", ["organizationId", "startAt"])
    .index("by_updated", ["updatedAt"]),
  clientFollowUps: defineTable({
    organizationId: v.string(),
    clientId: v.string(),
    type: v.union(
      v.literal("call"),
      v.literal("meeting"),
      v.literal("email"),
      v.literal("task"),
    ),
    title: v.string(),
    notes: v.optional(v.string()),
    followUpDate: v.number(),
    dueDate: v.optional(v.string()),
    status: v.union(
      v.literal("completed"),
      v.literal("upcoming"),
      v.literal("past"),
      v.literal("canceled"),
    ),
    opportunityId: v.optional(v.string()),
    projectId: v.optional(v.string()),
    calendarEventId: v.optional(v.string()),
    assigneeUserId: v.optional(v.string()),
    visibility: v.optional(v.union(v.literal("private"), v.literal("team"), v.literal("workspace"))),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_client", ["organizationId", "clientId"])
    .index("by_organization_status", ["organizationId", "status"])
    .index("by_organization_date", ["organizationId", "followUpDate"])
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
      v.literal("client"),
      v.literal("calendarEvent"),
      v.literal("task"),
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
  // DodoPayments Integration Tables
  dodoCustomers: defineTable({
    authId: v.string(),
    email: v.string(),
    dodoCustomerId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_auth_id", ["authId"])
    .index("by_dodo_customer_id", ["dodoCustomerId"])
    .index("by_email", ["email"]),
  dodoSubscriptions: defineTable({
    subscriptionId: v.string(),
    dodoCustomerId: v.string(),
    planId: v.string(),
    status: v.string(),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    metadata: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_subscription_id", ["subscriptionId"])
    .index("by_dodo_customer_id", ["dodoCustomerId"])
    .index("by_status", ["status"])
    .index("by_updated", ["updatedAt"]),
});
