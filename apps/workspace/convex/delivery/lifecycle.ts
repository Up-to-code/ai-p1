import { ConvexError, v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import { mutation, type MutationCtx } from "../_generated/server";
import { resolveDeliveryAccess } from "../access/delivery";
import { requireServerActor } from "../access/actor";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import {
  approvalStatusValidator, changeOrderStatusValidator, commercialModelValidator, concernSeverityValidator, concernStatusValidator,
  concernTypeValidator, contractValidator, deliverableValidator, engagementValidator, proposalValidator,
} from "./validators";
import { assertCommercialTransition, assertProposalAcceptable, nextAgreedAmount } from "./transitions";
import { contractSearchProjection, deliverableSearchProjection, engagementSearchProjection, proposalSearchProjection } from "./search";
import { emitAutomationEvent } from "../automations/events";

const proposalInputValidator = v.object({
  dealId: v.id("deals"), title: v.string(), scope: v.string(), commercialModel: commercialModelValidator,
  amountMinor: v.number(), currency: v.string(), validUntil: v.optional(v.number()),
});
const contractTermsValidator = v.object({ title: v.string(), scope: v.string(), billingTerms: v.string(), startAt: v.optional(v.number()), endAt: v.optional(v.number()) });

export const createProposal = mutation({
  args: { organizationId: v.string(), input: proposalInputValidator },
  returns: proposalValidator,
  handler: async (ctx, args) => {
    const actor = await requireServerActor(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "deal", "update");
    const deal = await requireDeal(ctx, args.organizationId, args.input.dealId);
    if (!deal.clientId) throw domainError("PROPOSAL_CLIENT_REQUIRED", "A Deal must reference a Client before a Proposal can be created.");
    const client = await ctx.db.get(deal.clientId);
    if (!client || client.organizationId !== args.organizationId || client.deletedAt || client.recordState === "deleted") throw domainError("PROPOSAL_CLIENT_INVALID", "The Deal Client is unavailable in this Organization.");
    if (!Number.isSafeInteger(args.input.amountMinor) || args.input.amountMinor < 0) throw domainError("INVALID_PROPOSAL_AMOUNT", "Proposal amount must be a non-negative integer in minor units.");
    if (args.input.validUntil !== undefined && args.input.validUntil <= Date.now()) throw domainError("INVALID_PROPOSAL_EXPIRY", "Proposal expiry must be in the future.");
    const previous = await ctx.db.query("proposals").withIndex("by_deal_version", (q) =>
      q.eq("organizationId", args.organizationId).eq("dealId", deal._id),
    ).order("desc").first();
    const now = Date.now();
    const id = await ctx.db.insert("proposals", {
      organizationId: args.organizationId, dealId: deal._id, clientId: deal.clientId, title: requiredText(args.input.title, "Proposal title"),
      version: (previous?.version ?? 0) + 1, status: "draft", commercialModel: args.input.commercialModel, scope: requiredText(args.input.scope, "Proposal scope"),
      amountMinor: args.input.amountMinor, currency: currency(args.input.currency), validUntil: args.input.validUntil,
      ownerUserId: deal.ownerUserId, recordState: "active", createdByUserId: actor.userId, createdAt: now, updatedAt: now,
    });
    if (previous && previous.status === "draft") {
      await ctx.db.patch(previous._id, { status: "superseded", updatedAt: now });
      const superseded = await ctx.db.get(previous._id);
      if (superseded) await proposalSearchProjection(ctx, superseded);
    }
    const proposal = await required(ctx.db.get(id), "Proposal could not be created.");
    await proposalSearchProjection(ctx, proposal);
    await audit(ctx, args.organizationId, actor.userId, "proposal.create", id, `Created proposal ${proposal.title} v${proposal.version}.`, now);
    return proposal;
  },
});

export const sendProposal = mutation({
  args: { organizationId: v.string(), proposalId: v.id("proposals") }, returns: proposalValidator,
  handler: async (ctx, args) => {
    const actor = await requireServerActor(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "deal", "update");
    const proposal = await requireProposal(ctx, args.organizationId, args.proposalId);
    assertCommercialTransition({ aggregate: "proposal", from: proposal.status, command: "send", to: "sent" });
    const now = Date.now();
    await ctx.db.patch(proposal._id, { status: "sent", sentAt: now, updatedAt: now });
    await ctx.db.patch(proposal.dealId, { stage: "proposal_sent", status: "open", updatedAt: now });
    const updated = await required(ctx.db.get(proposal._id), "Proposal was not found.");
    await proposalSearchProjection(ctx, updated);
    await audit(ctx, args.organizationId, actor.userId, "proposal.send", proposal._id, `Sent proposal ${proposal.title}.`, now);
    return updated;
  },
});

export const acceptProposal = mutation({
  args: { organizationId: v.string(), proposalId: v.id("proposals"), terms: contractTermsValidator }, returns: contractValidator,
  handler: async (ctx, args) => {
    const actor = await requireServerActor(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "deal", "update");
    const proposal = await requireProposal(ctx, args.organizationId, args.proposalId);
    if (proposal.contractId) return required(ctx.db.get(proposal.contractId), "Contract was not found.");
    assertProposalAcceptable(proposal.status, proposal.validUntil, Date.now());
    assertCommercialTransition({ aggregate: "proposal", from: proposal.status, command: "accept", to: "accepted" });
    if (args.terms.startAt && args.terms.endAt && args.terms.endAt < args.terms.startAt) throw domainError("INVALID_CONTRACT_DATES", "Contract end date cannot precede its start date.");
    const now = Date.now();
    const contractId = await ctx.db.insert("contracts", {
      organizationId: args.organizationId, proposalId: proposal._id, dealId: proposal.dealId, clientId: proposal.clientId,
      title: requiredText(args.terms.title, "Contract title"), status: "draft", commercialModel: proposal.commercialModel, scope: requiredText(args.terms.scope, "Contract scope"),
      amountMinor: proposal.amountMinor, currency: proposal.currency, billingTerms: requiredText(args.terms.billingTerms, "Billing terms"), startAt: args.terms.startAt, endAt: args.terms.endAt,
      ownerUserId: proposal.ownerUserId, recordState: "active", createdByUserId: actor.userId, createdAt: now, updatedAt: now,
    });
    await ctx.db.patch(proposal._id, { status: "accepted", acceptedAt: now, contractId, updatedAt: now });
    await ctx.db.patch(proposal.dealId, { stage: "contract_sent", updatedAt: now });
    const [contract, accepted] = await Promise.all([ctx.db.get(contractId), ctx.db.get(proposal._id)]);
    if (!contract || !accepted) throw new Error("Commercial handoff failed.");
    await Promise.all([contractSearchProjection(ctx, contract), proposalSearchProjection(ctx, accepted)]);
    await audit(ctx, args.organizationId, actor.userId, "proposal.accept", proposal._id, `Accepted proposal and created contract ${contract.title}.`, now);
    await emitAutomationEvent(ctx, { organizationId: args.organizationId, eventType: "proposal.accepted", resourceType: "proposal", resourceId: String(proposal._id), payload: { contractId: String(contract._id), clientId: String(contract.clientId) }, actorUserId: actor.userId });
    return contract;
  },
});

export const sendContract = mutation({
  args: { organizationId: v.string(), contractId: v.id("contracts") }, returns: contractValidator,
  handler: async (ctx, args) => transitionContract(ctx, args, "draft", "send", "sent"),
});

export const signContract = mutation({
  args: { organizationId: v.string(), contractId: v.id("contracts") }, returns: contractValidator,
  handler: async (ctx, args) => transitionContract(ctx, args, "sent", "sign", "signed"),
});

export const activateEngagement = mutation({
  args: { organizationId: v.string(), contractId: v.id("contracts") }, returns: engagementValidator,
  handler: async (ctx, args) => {
    const access = await resolveDeliveryAccess(ctx, args.organizationId);
    await access.assertCanCreate();
    const contract = await requireContract(ctx, args.organizationId, args.contractId);
    if (contract.engagementId) return required(ctx.db.get(contract.engagementId), "Engagement was not found.");
    assertCommercialTransition({ aggregate: "contract", from: contract.status, command: "activate", to: "active" });
    const now = Date.now();
    const engagementId = await ctx.db.insert("engagements", {
      organizationId: args.organizationId, contractId: contract._id, dealId: contract.dealId, clientId: contract.clientId, name: contract.title,
      status: "active", health: "on_track", commercialModel: contract.commercialModel, scope: contract.scope, agreedAmountMinor: contract.amountMinor,
      currency: contract.currency, startAt: contract.startAt, endAt: contract.endAt, portalEnabled: false, ownerUserId: contract.ownerUserId,
      recordState: "active", createdByUserId: access.actor.userId, createdAt: now, updatedAt: now, activatedAt: now,
    });
    await ctx.db.patch(contract._id, { status: "active", engagementId, updatedAt: now });
    await ctx.db.patch(contract.dealId, { stage: "won", status: "won", closedAt: now, updatedAt: now });
    const [engagement, activeContract] = await Promise.all([ctx.db.get(engagementId), ctx.db.get(contract._id)]);
    if (!engagement || !activeContract) throw new Error("Engagement activation failed.");
    await Promise.all([engagementSearchProjection(ctx, engagement), contractSearchProjection(ctx, activeContract)]);
    await audit(ctx, args.organizationId, access.actor.userId, "engagement.activate", engagementId, `Activated engagement ${engagement.name}.`, now);
    await emitAutomationEvent(ctx, { organizationId: args.organizationId, eventType: "engagement.activated", resourceType: "engagement", resourceId: String(engagementId), payload: { contractId: String(contract._id), clientId: String(contract.clientId) }, actorUserId: access.actor.userId });
    return engagement;
  },
});

export const linkProject = mutation({
  args: { organizationId: v.string(), engagementId: v.id("engagements"), projectId: v.id("projects"), role: v.union(v.literal("primary"), v.literal("delivery"), v.literal("support")) },
  returns: v.id("engagementProjects"),
  handler: async (ctx, args) => {
    const access = await resolveDeliveryAccess(ctx, args.organizationId);
    const engagement = await requireEngagement(ctx, args.organizationId, args.engagementId);
    await access.assertCanUpdate(engagement);
    const project = await ctx.db.get(args.projectId);
    if (!project || project.organizationId !== args.organizationId || project.deletedAt) throw domainError("PROJECT_NOT_FOUND", "Project was not found.");
    access.projectAccess.assertCanUpdate(project);
    const existing = await ctx.db.query("engagementProjects").withIndex("by_engagement_project", (q) =>
      q.eq("organizationId", args.organizationId).eq("engagementId", engagement._id).eq("projectId", project._id),
    ).unique();
    const now = Date.now();
    const id = existing?._id ?? await ctx.db.insert("engagementProjects", { organizationId: args.organizationId, engagementId: engagement._id, projectId: project._id, role: args.role, createdByUserId: access.actor.userId, createdAt: now, updatedAt: now });
    if (existing) await ctx.db.patch(existing._id, { role: args.role, deletedAt: undefined, updatedAt: now });
    const deal = await ctx.db.get(engagement.dealId);
    if (deal && !deal.projectId) await ctx.db.patch(deal._id, { projectId: project._id, updatedAt: now });
    await engagementSearchProjection(ctx, engagement);
    await audit(ctx, args.organizationId, access.actor.userId, "engagement.project.link", engagement._id, `Linked project ${project.name} to engagement ${engagement.name}.`, now);
    return id;
  },
});

export const createDeliverable = mutation({
  args: { organizationId: v.string(), engagementId: v.id("engagements"), projectId: v.optional(v.id("projects")), name: v.string(), description: v.optional(v.string()), dueAt: v.optional(v.number()) },
  returns: deliverableValidator,
  handler: async (ctx, args) => {
    const access = await resolveDeliveryAccess(ctx, args.organizationId);
    const engagement = await requireEngagement(ctx, args.organizationId, args.engagementId);
    await access.assertCanUpdate(engagement);
    if (args.projectId) await requireLinkedProject(ctx, engagement, args.projectId);
    const now = Date.now();
    const id = await ctx.db.insert("deliverables", { ...args, name: requiredText(args.name, "Deliverable name"), description: args.description?.trim(), status: "planned", ownerUserId: access.actor.userId, recordState: "active", createdByUserId: access.actor.userId, createdAt: now, updatedAt: now });
    const deliverable = await required(ctx.db.get(id), "Deliverable could not be created.");
    await deliverableSearchProjection(ctx, deliverable);
    await audit(ctx, args.organizationId, access.actor.userId, "deliverable.create", id, `Created deliverable ${deliverable.name}.`, now);
    return deliverable;
  },
});

export const submitDeliverable = mutation({
  args: { organizationId: v.string(), deliverableId: v.id("deliverables") }, returns: deliverableValidator,
  handler: async (ctx, args) => {
    const deliverable = await requireDeliverable(ctx, args.organizationId, args.deliverableId);
    const access = await resolveDeliveryAccess(ctx, args.organizationId);
    const engagement = await requireEngagement(ctx, args.organizationId, deliverable.engagementId);
    await access.assertCanUpdate(engagement);
    if (deliverable.status !== "planned" && deliverable.status !== "in_progress") throw domainError("INVALID_DELIVERABLE_TRANSITION", "Only planned or in-progress Deliverables can be submitted.");
    assertCommercialTransition({ aggregate: "deliverable", from: deliverable.status, command: "submit", to: "submitted" });
    const now = Date.now();
    const approvalId = await ctx.db.insert("deliveryApprovals", { organizationId: args.organizationId, engagementId: engagement._id, resourceType: "deliverable", resourceId: String(deliverable._id), status: "pending", requestedByUserId: access.actor.userId, requestedAt: now, createdAt: now, updatedAt: now });
    await ctx.db.patch(deliverable._id, { status: "submitted", approvalId, submittedAt: now, updatedAt: now });
    const updated = await required(ctx.db.get(deliverable._id), "Deliverable was not found.");
    await deliverableSearchProjection(ctx, updated);
    await audit(ctx, args.organizationId, access.actor.userId, "deliverable.submit", deliverable._id, `Submitted deliverable ${deliverable.name} for approval.`, now);
    return updated;
  },
});

export const decideApproval = mutation({
  args: { organizationId: v.string(), approvalId: v.id("deliveryApprovals"), decision: v.union(v.literal("approved"), v.literal("rejected")), note: v.optional(v.string()) },
  returns: v.object({ status: approvalStatusValidator }),
  handler: async (ctx, args) => {
    const approval = await ctx.db.get(args.approvalId);
    if (!approval || approval.organizationId !== args.organizationId || approval.status !== "pending") throw domainError("APPROVAL_NOT_PENDING", "Approval was not found or is no longer pending.");
    const access = await resolveDeliveryAccess(ctx, args.organizationId);
    const engagement = await requireEngagement(ctx, args.organizationId, approval.engagementId);
    await access.assertCanUpdate(engagement);
    const now = Date.now();
    await ctx.db.patch(approval._id, { status: args.decision, decidedByUserId: access.actor.userId, decidedAt: now, decisionNote: args.note?.trim(), updatedAt: now });
    if (approval.resourceType === "deliverable") {
      const id = ctx.db.normalizeId("deliverables", approval.resourceId);
      const deliverable = id ? await ctx.db.get(id) : null;
      if (!deliverable || deliverable.approvalId !== approval._id || deliverable.status !== "submitted") throw domainError("APPROVAL_RESOURCE_MISMATCH", "Approval resource no longer matches the Deliverable.");
      assertCommercialTransition({ aggregate: "deliverable", from: "submitted", command: args.decision === "approved" ? "approve" : "reject", to: args.decision });
      await ctx.db.patch(deliverable._id, { status: args.decision, approvedAt: args.decision === "approved" ? now : undefined, updatedAt: now });
      const updated = await ctx.db.get(deliverable._id);
      if (updated) await deliverableSearchProjection(ctx, updated);
    } else {
      const id = ctx.db.normalizeId("changeOrders", approval.resourceId);
      const order = id ? await ctx.db.get(id) : null;
      if (!order || order.approvalId !== approval._id || order.status !== "submitted") throw domainError("APPROVAL_RESOURCE_MISMATCH", "Approval resource no longer matches the Change Order.");
      assertCommercialTransition({ aggregate: "change_order", from: "submitted", command: args.decision === "approved" ? "approve" : "reject", to: args.decision });
      await ctx.db.patch(order._id, { status: args.decision, approvedAt: args.decision === "approved" ? now : undefined, updatedAt: now });
      if (args.decision === "approved") {
        await ctx.db.patch(engagement._id, { agreedAmountMinor: nextAgreedAmount(engagement.agreedAmountMinor, order.amountDeltaMinor), updatedAt: now });
        const updatedEngagement = await ctx.db.get(engagement._id);
        if (updatedEngagement) await engagementSearchProjection(ctx, updatedEngagement);
      }
    }
    await audit(ctx, args.organizationId, access.actor.userId, `delivery.approval.${args.decision}`, approval._id, `${args.decision === "approved" ? "Approved" : "Rejected"} ${approval.resourceType.replace("_", " ")}.`, now);
    await emitAutomationEvent(ctx, { organizationId: args.organizationId, eventType: `${approval.resourceType}.${args.decision}`, resourceType: approval.resourceType, resourceId: approval.resourceId, payload: { engagementId: String(engagement._id), approvalId: String(approval._id) }, actorUserId: access.actor.userId });
    return { status: args.decision };
  },
});

export const createChangeOrder = mutation({
  args: { organizationId: v.string(), engagementId: v.id("engagements"), title: v.string(), reason: v.string(), scopeDelta: v.string(), amountDeltaMinor: v.number() },
  returns: v.id("changeOrders"),
  handler: async (ctx, args) => {
    const access = await resolveDeliveryAccess(ctx, args.organizationId);
    const engagement = await requireEngagement(ctx, args.organizationId, args.engagementId);
    await access.assertCanUpdate(engagement);
    const now = Date.now();
    if (!Number.isSafeInteger(args.amountDeltaMinor)) throw domainError("INVALID_CHANGE_ORDER_AMOUNT", "Change Order amount must be an integer in minor units.");
    const id = await ctx.db.insert("changeOrders", { ...args, title: requiredText(args.title, "Change Order title"), reason: requiredText(args.reason, "Change Order reason"), scopeDelta: requiredText(args.scopeDelta, "Scope change"), currency: engagement.currency, status: "draft", ownerUserId: access.actor.userId, recordState: "active", createdByUserId: access.actor.userId, createdAt: now, updatedAt: now });
    await audit(ctx, args.organizationId, access.actor.userId, "change_order.create", id, `Created change order ${args.title}.`, now);
    return id;
  },
});

export const submitChangeOrder = mutation({
  args: { organizationId: v.string(), changeOrderId: v.id("changeOrders") }, returns: v.object({ status: changeOrderStatusValidator }),
  handler: async (ctx, args) => {
    const order = await requireChangeOrder(ctx, args.organizationId, args.changeOrderId);
    const access = await resolveDeliveryAccess(ctx, args.organizationId);
    const engagement = await requireEngagement(ctx, args.organizationId, order.engagementId);
    await access.assertCanUpdate(engagement);
    assertCommercialTransition({ aggregate: "change_order", from: order.status, command: "submit", to: "submitted" });
    const now = Date.now();
    const approvalId = await ctx.db.insert("deliveryApprovals", { organizationId: args.organizationId, engagementId: engagement._id, resourceType: "change_order", resourceId: String(order._id), status: "pending", requestedByUserId: access.actor.userId, requestedAt: now, createdAt: now, updatedAt: now });
    await ctx.db.patch(order._id, { status: "submitted", approvalId, submittedAt: now, updatedAt: now });
    return { status: "submitted" as const };
  },
});

export const recordConcern = mutation({
  args: { organizationId: v.string(), engagementId: v.id("engagements"), projectId: v.optional(v.id("projects")), type: concernTypeValidator, title: v.string(), description: v.string(), severity: concernSeverityValidator },
  returns: v.id("deliveryConcerns"),
  handler: async (ctx, args) => {
    const access = await resolveDeliveryAccess(ctx, args.organizationId);
    const engagement = await requireEngagement(ctx, args.organizationId, args.engagementId);
    await access.assertCanUpdate(engagement);
    if (args.projectId) await requireLinkedProject(ctx, engagement, args.projectId);
    const now = Date.now();
    const id = await ctx.db.insert("deliveryConcerns", { ...args, title: requiredText(args.title, "Risk or Issue title"), description: requiredText(args.description, "Risk or Issue description"), status: "open", ownerUserId: access.actor.userId, recordState: "active", createdByUserId: access.actor.userId, createdAt: now, updatedAt: now });
    if (args.severity === "critical") await ctx.db.patch(engagement._id, { health: "blocked", updatedAt: now });
    else if (args.severity === "high" && engagement.health === "on_track") await ctx.db.patch(engagement._id, { health: "at_risk", updatedAt: now });
    const updatedEngagement = await ctx.db.get(engagement._id);
    if (updatedEngagement) await engagementSearchProjection(ctx, updatedEngagement);
    await audit(ctx, args.organizationId, access.actor.userId, `delivery.${args.type}.create`, id, `Recorded ${args.severity} ${args.type}: ${args.title}.`, now);
    return id;
  },
});

export const updateConcern = mutation({
  args: { organizationId: v.string(), concernId: v.id("deliveryConcerns"), status: concernStatusValidator, mitigation: v.optional(v.string()) }, returns: v.object({ status: concernStatusValidator }),
  handler: async (ctx, args) => {
    const concern = await ctx.db.get(args.concernId);
    if (!concern || concern.organizationId !== args.organizationId || concern.deletedAt) throw domainError("CONCERN_NOT_FOUND", "Risk or Issue was not found.");
    const access = await resolveDeliveryAccess(ctx, args.organizationId);
    const engagement = await requireEngagement(ctx, args.organizationId, concern.engagementId);
    await access.assertCanUpdate(engagement);
    const now = Date.now();
    await ctx.db.patch(concern._id, { status: args.status, mitigation: args.mitigation?.trim(), resolvedAt: args.status === "resolved" || args.status === "closed" ? now : undefined, updatedAt: now });
    return { status: args.status };
  },
});

export const invitePortalIdentity = mutation({
  args: { organizationId: v.string(), engagementId: v.id("engagements"), email: v.string(), name: v.string() },
  returns: v.id("portalIdentities"),
  handler: async (ctx, args) => {
    const access = await resolveDeliveryAccess(ctx, args.organizationId);
    const engagement = await requireEngagement(ctx, args.organizationId, args.engagementId);
    await access.assertCanUpdate(engagement);
    const email = args.email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/u.test(email)) throw domainError("INVALID_PORTAL_EMAIL", "A valid portal email is required.");
    const existing = await ctx.db.query("portalIdentities").withIndex("by_org_email", (q) => q.eq("organizationId", args.organizationId).eq("email", email)).unique();
    const now = Date.now();
    if (existing) {
      if (existing.clientId !== engagement.clientId) throw domainError("PORTAL_IDENTITY_CLIENT_MISMATCH", "Portal identity already belongs to a different Client.");
      await ctx.db.patch(existing._id, { name: requiredText(args.name, "Portal contact name"), status: "invited", revokedAt: undefined, updatedAt: now });
      return existing._id;
    }
    return ctx.db.insert("portalIdentities", { organizationId: args.organizationId, clientId: engagement.clientId, email, name: requiredText(args.name, "Portal contact name"), status: "invited", invitedByUserId: access.actor.userId, createdAt: now, updatedAt: now });
  },
});

export const grantPortalAccess = mutation({
  args: { organizationId: v.string(), engagementId: v.id("engagements"), portalIdentityId: v.id("portalIdentities"), capabilities: v.array(v.union(v.literal("view"), v.literal("comment"), v.literal("approve"), v.literal("upload"))) },
  returns: v.id("portalGrants"),
  handler: async (ctx, args) => {
    const access = await resolveDeliveryAccess(ctx, args.organizationId);
    const engagement = await requireEngagement(ctx, args.organizationId, args.engagementId);
    await access.assertCanUpdate(engagement);
    const identity = await ctx.db.get(args.portalIdentityId);
    if (!identity || identity.organizationId !== args.organizationId || identity.clientId !== engagement.clientId || identity.status === "revoked") throw domainError("PORTAL_IDENTITY_NOT_FOUND", "Portal identity is unavailable for this Client.");
    const existing = await ctx.db.query("portalGrants").withIndex("by_identity_engagement", (q) => q.eq("organizationId", args.organizationId).eq("portalIdentityId", identity._id).eq("engagementId", engagement._id)).unique();
    const now = Date.now();
    const capabilities = [...new Set(args.capabilities)];
    if (!capabilities.includes("view")) capabilities.unshift("view");
    if (existing) {
      await ctx.db.patch(existing._id, { capabilities, status: "active", revokedAt: undefined, updatedAt: now });
      await ctx.db.patch(engagement._id, { portalEnabled: true, updatedAt: now });
      return existing._id;
    }
    const id = await ctx.db.insert("portalGrants", { organizationId: args.organizationId, portalIdentityId: identity._id, engagementId: engagement._id, capabilities, status: "active", createdByUserId: access.actor.userId, createdAt: now, updatedAt: now });
    await ctx.db.patch(engagement._id, { portalEnabled: true, updatedAt: now });
    await audit(ctx, args.organizationId, access.actor.userId, "portal.grant.create", id, `Granted portal access to ${identity.email} for ${engagement.name}.`, now);
    return id;
  },
});

async function transitionContract(ctx: MutationCtx, args: { organizationId: string; contractId: Id<"contracts"> }, from: "draft" | "sent", command: "send" | "sign", to: "sent" | "signed") {
  const actor = await requireServerActor(ctx);
  await assertOrganizationResourcePermission(ctx, args.organizationId, "deal", "update");
  const contract = await requireContract(ctx, args.organizationId, args.contractId);
  assertCommercialTransition({ aggregate: "contract", from, command, to });
  if (contract.status !== from) throw domainError("INVALID_CONTRACT_TRANSITION", `Contract must be ${from} before it can be ${to}.`);
  const now = Date.now();
  await ctx.db.patch(contract._id, { status: to, signedAt: to === "signed" ? now : contract.signedAt, updatedAt: now });
  const updated = await required(ctx.db.get(contract._id), "Contract was not found.");
  await contractSearchProjection(ctx, updated);
  await audit(ctx, args.organizationId, actor.userId, `contract.${command}`, contract._id, `${to === "sent" ? "Sent" : "Signed"} contract ${contract.title}.`, now);
  return updated;
}

async function requireDeal(ctx: MutationCtx, organizationId: string, id: Id<"deals">) {
  const record = await ctx.db.get(id);
  if (!record || record.organizationId !== organizationId || record.deletedAt || record.recordState === "deleted") throw domainError("DEAL_NOT_FOUND", "Deal was not found.");
  return record;
}
async function requireProposal(ctx: MutationCtx, organizationId: string, id: Id<"proposals">) { return requireOwned(ctx.db.get(id), organizationId, "Proposal was not found."); }
async function requireContract(ctx: MutationCtx, organizationId: string, id: Id<"contracts">) { return requireOwned(ctx.db.get(id), organizationId, "Contract was not found."); }
async function requireEngagement(ctx: MutationCtx, organizationId: string, id: Id<"engagements">) { return requireOwned(ctx.db.get(id), organizationId, "Engagement was not found."); }
async function requireDeliverable(ctx: MutationCtx, organizationId: string, id: Id<"deliverables">) { return requireOwned(ctx.db.get(id), organizationId, "Deliverable was not found."); }
async function requireChangeOrder(ctx: MutationCtx, organizationId: string, id: Id<"changeOrders">) { return requireOwned(ctx.db.get(id), organizationId, "Change Order was not found."); }

async function requireOwned<T extends { organizationId: string; deletedAt?: number; recordState: string }>(value: Promise<T | null>, organizationId: string, message: string) {
  const record = await value;
  if (!record || record.organizationId !== organizationId || record.deletedAt || record.recordState === "deleted") throw domainError("RESOURCE_NOT_FOUND", message);
  return record;
}
async function required<T>(value: Promise<T | null>, message: string) { const record = await value; if (!record) throw new Error(message); return record; }

async function requireLinkedProject(ctx: MutationCtx, engagement: Doc<"engagements">, projectId: Id<"projects">) {
  const link = await ctx.db.query("engagementProjects").withIndex("by_engagement_project", (q) =>
    q.eq("organizationId", engagement.organizationId).eq("engagementId", engagement._id).eq("projectId", projectId),
  ).unique();
  if (!link || link.deletedAt) throw domainError("PROJECT_NOT_LINKED", "Project must be linked to the Engagement.");
}

async function audit(ctx: MutationCtx, organizationId: string, actorUserId: string, action: string, target: string, summary: string, createdAt: number) {
  await ctx.db.insert("organizationAuditEvents", { organizationId, actorUserId, action, target, summary, createdAt });
}
function currency(value: string) { const normalized = value.trim().toUpperCase(); if (!/^[A-Z]{3}$/u.test(normalized)) throw domainError("INVALID_CURRENCY", "Currency must be a three-letter ISO code."); return normalized; }
function requiredText(value: string, label: string) { const normalized = value.trim(); if (!normalized) throw domainError("REQUIRED_TEXT", `${label} is required.`); return normalized; }
function domainError(code: string, message: string) { return new ConvexError({ code, message }); }
