import { defineTable } from "convex/server";
import { v } from "convex/values";
import { recordStateValidator } from "./validators";
import {
  approvalStatusValidator, changeOrderStatusValidator, commercialModelValidator, concernSeverityValidator, concernStatusValidator,
  concernTypeValidator, contractStatusValidator, deliverableStatusValidator, deliveryHealthValidator, engagementStatusValidator, proposalStatusValidator,
} from "../delivery/validators";

const owned = {
  ownerUserId: v.string(), recordState: recordStateValidator, createdByUserId: v.string(), createdAt: v.number(), updatedAt: v.number(), deletedAt: v.optional(v.number()),
};

export const deliveryTables = {
  proposals: defineTable({
    organizationId: v.string(), dealId: v.id("deals"), clientId: v.id("clients"), title: v.string(), version: v.number(), status: proposalStatusValidator,
    commercialModel: commercialModelValidator, scope: v.string(), amountMinor: v.number(), currency: v.string(), validUntil: v.optional(v.number()),
    contractId: v.optional(v.id("contracts")), sentAt: v.optional(v.number()), acceptedAt: v.optional(v.number()), ...owned,
  }).index("by_org_state_updated", ["organizationId", "recordState", "updatedAt"])
    .index("by_deal_version", ["organizationId", "dealId", "version"])
    .index("by_client_status", ["organizationId", "clientId", "status"]),
  contracts: defineTable({
    organizationId: v.string(), proposalId: v.id("proposals"), dealId: v.id("deals"), clientId: v.id("clients"), title: v.string(), status: contractStatusValidator,
    commercialModel: commercialModelValidator, scope: v.string(), amountMinor: v.number(), currency: v.string(), billingTerms: v.string(), startAt: v.optional(v.number()),
    endAt: v.optional(v.number()), signedAt: v.optional(v.number()), engagementId: v.optional(v.id("engagements")), ...owned,
  }).index("by_org_state_updated", ["organizationId", "recordState", "updatedAt"])
    .index("by_proposal", ["organizationId", "proposalId"])
    .index("by_client_status", ["organizationId", "clientId", "status"]),
  engagements: defineTable({
    organizationId: v.string(), contractId: v.id("contracts"), dealId: v.id("deals"), clientId: v.id("clients"), name: v.string(), status: engagementStatusValidator,
    health: deliveryHealthValidator, commercialModel: commercialModelValidator, scope: v.string(), agreedAmountMinor: v.number(), currency: v.string(),
    startAt: v.optional(v.number()), endAt: v.optional(v.number()), portalEnabled: v.boolean(), activatedAt: v.optional(v.number()), completedAt: v.optional(v.number()), ...owned,
  }).index("by_org_state_updated", ["organizationId", "recordState", "updatedAt"])
    .index("by_org_status_health", ["organizationId", "status", "health", "updatedAt"])
    .index("by_client", ["organizationId", "clientId"])
    .index("by_commercial_model", ["organizationId", "commercialModel", "status"]),
  engagementProjects: defineTable({
    organizationId: v.string(), engagementId: v.id("engagements"), projectId: v.id("projects"), role: v.union(v.literal("primary"), v.literal("delivery"), v.literal("support")),
    createdByUserId: v.string(), createdAt: v.number(), updatedAt: v.number(), deletedAt: v.optional(v.number()),
  }).index("by_engagement_project", ["organizationId", "engagementId", "projectId"])
    .index("by_project", ["organizationId", "projectId", "engagementId"]),
  deliverables: defineTable({
    organizationId: v.string(), engagementId: v.id("engagements"), projectId: v.optional(v.id("projects")), name: v.string(), description: v.optional(v.string()),
    status: deliverableStatusValidator, dueAt: v.optional(v.number()), approvalId: v.optional(v.id("deliveryApprovals")), submittedAt: v.optional(v.number()), approvedAt: v.optional(v.number()), ...owned,
  }).index("by_engagement_status", ["organizationId", "engagementId", "status", "dueAt"])
    .index("by_project_status", ["organizationId", "projectId", "status", "dueAt"])
    .index("by_org_state_updated", ["organizationId", "recordState", "updatedAt"]),
  deliveryApprovals: defineTable({
    organizationId: v.string(), engagementId: v.id("engagements"), resourceType: v.union(v.literal("deliverable"), v.literal("change_order")), resourceId: v.string(),
    status: approvalStatusValidator, requestedByUserId: v.string(), requestedAt: v.number(), decidedByUserId: v.optional(v.string()), decidedAt: v.optional(v.number()), decisionNote: v.optional(v.string()),
    createdAt: v.number(), updatedAt: v.number(),
  }).index("by_engagement_status", ["organizationId", "engagementId", "status", "requestedAt"])
    .index("by_resource", ["organizationId", "resourceType", "resourceId"]),
  changeOrders: defineTable({
    organizationId: v.string(), engagementId: v.id("engagements"), title: v.string(), reason: v.string(), scopeDelta: v.string(), amountDeltaMinor: v.number(), currency: v.string(),
    status: changeOrderStatusValidator, approvalId: v.optional(v.id("deliveryApprovals")), submittedAt: v.optional(v.number()), approvedAt: v.optional(v.number()), ...owned,
  }).index("by_engagement_status", ["organizationId", "engagementId", "status", "updatedAt"]),
  deliveryConcerns: defineTable({
    organizationId: v.string(), engagementId: v.id("engagements"), projectId: v.optional(v.id("projects")), type: concernTypeValidator, title: v.string(), description: v.string(),
    severity: concernSeverityValidator, status: concernStatusValidator, mitigation: v.optional(v.string()), resolvedAt: v.optional(v.number()), ...owned,
  }).index("by_engagement_type_status", ["organizationId", "engagementId", "type", "status", "updatedAt"]),
  portalIdentities: defineTable({
    organizationId: v.string(), clientId: v.id("clients"), email: v.string(), name: v.string(), status: v.union(v.literal("invited"), v.literal("active"), v.literal("revoked")),
    invitedByUserId: v.string(), createdAt: v.number(), updatedAt: v.number(), activatedAt: v.optional(v.number()), revokedAt: v.optional(v.number()),
  }).index("by_org_email", ["organizationId", "email"])
    .index("by_client_status", ["organizationId", "clientId", "status"]),
  portalGrants: defineTable({
    organizationId: v.string(), portalIdentityId: v.id("portalIdentities"), engagementId: v.id("engagements"), capabilities: v.array(v.union(v.literal("view"), v.literal("comment"), v.literal("approve"), v.literal("upload"))),
    status: v.union(v.literal("active"), v.literal("revoked")), createdByUserId: v.string(), createdAt: v.number(), updatedAt: v.number(), revokedAt: v.optional(v.number()),
  }).index("by_identity_engagement", ["organizationId", "portalIdentityId", "engagementId"])
    .index("by_engagement_status", ["organizationId", "engagementId", "status"]),
};
