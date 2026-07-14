import { v } from "convex/values";
import { recordStateValidator } from "../schema/validators";

export const commercialModelValidator = v.union(v.literal("fixed_scope"), v.literal("retainer"), v.literal("time_and_materials"));
export const proposalStatusValidator = v.union(v.literal("draft"), v.literal("sent"), v.literal("accepted"), v.literal("rejected"), v.literal("expired"), v.literal("superseded"));
export const contractStatusValidator = v.union(v.literal("draft"), v.literal("sent"), v.literal("signed"), v.literal("active"), v.literal("terminated"), v.literal("expired"));
export const engagementStatusValidator = v.union(v.literal("planned"), v.literal("active"), v.literal("on_hold"), v.literal("completed"), v.literal("cancelled"));
export const deliveryHealthValidator = v.union(v.literal("on_track"), v.literal("at_risk"), v.literal("blocked"));
export const deliverableStatusValidator = v.union(v.literal("planned"), v.literal("in_progress"), v.literal("submitted"), v.literal("approved"), v.literal("rejected"));
export const approvalStatusValidator = v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("cancelled"));
export const changeOrderStatusValidator = v.union(v.literal("draft"), v.literal("submitted"), v.literal("approved"), v.literal("rejected"), v.literal("cancelled"));
export const concernTypeValidator = v.union(v.literal("risk"), v.literal("issue"));
export const concernSeverityValidator = v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical"));
export const concernStatusValidator = v.union(v.literal("open"), v.literal("mitigated"), v.literal("resolved"), v.literal("closed"));

export const proposalValidator = v.object({
  _id: v.id("proposals"), _creationTime: v.number(), organizationId: v.string(), dealId: v.id("deals"), clientId: v.id("clients"),
  title: v.string(), version: v.number(), status: proposalStatusValidator, commercialModel: commercialModelValidator,
  scope: v.string(), amountMinor: v.number(), currency: v.string(), validUntil: v.optional(v.number()), contractId: v.optional(v.id("contracts")),
  ownerUserId: v.string(), recordState: recordStateValidator, createdByUserId: v.string(), createdAt: v.number(), updatedAt: v.number(), sentAt: v.optional(v.number()), acceptedAt: v.optional(v.number()), deletedAt: v.optional(v.number()),
});

export const contractValidator = v.object({
  _id: v.id("contracts"), _creationTime: v.number(), organizationId: v.string(), proposalId: v.id("proposals"), dealId: v.id("deals"), clientId: v.id("clients"),
  title: v.string(), status: contractStatusValidator, commercialModel: commercialModelValidator, scope: v.string(), amountMinor: v.number(), currency: v.string(),
  billingTerms: v.string(), startAt: v.optional(v.number()), endAt: v.optional(v.number()), signedAt: v.optional(v.number()), engagementId: v.optional(v.id("engagements")),
  ownerUserId: v.string(), recordState: recordStateValidator, createdByUserId: v.string(), createdAt: v.number(), updatedAt: v.number(), deletedAt: v.optional(v.number()),
});

export const engagementValidator = v.object({
  _id: v.id("engagements"), _creationTime: v.number(), organizationId: v.string(), contractId: v.id("contracts"), dealId: v.id("deals"), clientId: v.id("clients"),
  name: v.string(), status: engagementStatusValidator, health: deliveryHealthValidator, commercialModel: commercialModelValidator, scope: v.string(),
  agreedAmountMinor: v.number(), currency: v.string(), startAt: v.optional(v.number()), endAt: v.optional(v.number()), portalEnabled: v.boolean(),
  ownerUserId: v.string(), recordState: recordStateValidator, createdByUserId: v.string(), createdAt: v.number(), updatedAt: v.number(), activatedAt: v.optional(v.number()), completedAt: v.optional(v.number()), deletedAt: v.optional(v.number()),
});

export const deliverableValidator = v.object({
  _id: v.id("deliverables"), _creationTime: v.number(), organizationId: v.string(), engagementId: v.id("engagements"), projectId: v.optional(v.id("projects")),
  name: v.string(), description: v.optional(v.string()), status: deliverableStatusValidator, dueAt: v.optional(v.number()), approvalId: v.optional(v.id("deliveryApprovals")),
  ownerUserId: v.string(), recordState: recordStateValidator, createdByUserId: v.string(), createdAt: v.number(), updatedAt: v.number(), submittedAt: v.optional(v.number()), approvedAt: v.optional(v.number()), deletedAt: v.optional(v.number()),
});

export const engagementProjectValidator = v.object({
  _id: v.id("engagementProjects"), _creationTime: v.number(), organizationId: v.string(), engagementId: v.id("engagements"), projectId: v.id("projects"),
  role: v.union(v.literal("primary"), v.literal("delivery"), v.literal("support")), createdByUserId: v.string(), createdAt: v.number(), updatedAt: v.number(), deletedAt: v.optional(v.number()),
});

export const approvalValidator = v.object({
  _id: v.id("deliveryApprovals"), _creationTime: v.number(), organizationId: v.string(), engagementId: v.id("engagements"),
  resourceType: v.union(v.literal("deliverable"), v.literal("change_order")), resourceId: v.string(), status: approvalStatusValidator,
  requestedByUserId: v.string(), requestedAt: v.number(), decidedByUserId: v.optional(v.string()), decidedAt: v.optional(v.number()), decisionNote: v.optional(v.string()), createdAt: v.number(), updatedAt: v.number(),
});

export const changeOrderValidator = v.object({
  _id: v.id("changeOrders"), _creationTime: v.number(), organizationId: v.string(), engagementId: v.id("engagements"), title: v.string(), reason: v.string(), scopeDelta: v.string(),
  amountDeltaMinor: v.number(), currency: v.string(), status: changeOrderStatusValidator, approvalId: v.optional(v.id("deliveryApprovals")), submittedAt: v.optional(v.number()), approvedAt: v.optional(v.number()),
  ownerUserId: v.string(), recordState: recordStateValidator, createdByUserId: v.string(), createdAt: v.number(), updatedAt: v.number(), deletedAt: v.optional(v.number()),
});

export const concernValidator = v.object({
  _id: v.id("deliveryConcerns"), _creationTime: v.number(), organizationId: v.string(), engagementId: v.id("engagements"), projectId: v.optional(v.id("projects")),
  type: concernTypeValidator, title: v.string(), description: v.string(), severity: concernSeverityValidator, status: concernStatusValidator, mitigation: v.optional(v.string()), resolvedAt: v.optional(v.number()),
  ownerUserId: v.string(), recordState: recordStateValidator, createdByUserId: v.string(), createdAt: v.number(), updatedAt: v.number(), deletedAt: v.optional(v.number()),
});
