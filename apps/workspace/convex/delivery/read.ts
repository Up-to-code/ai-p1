import { v } from "convex/values";
import { query } from "../_generated/server";
import { resolveDeliveryAccess } from "../access/delivery";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import {
  approvalValidator, changeOrderValidator, concernValidator, contractValidator, deliverableValidator,
  engagementProjectValidator, engagementStatusValidator, engagementValidator, proposalValidator,
} from "./validators";

const milestoneValidator = v.object({
  _id: v.id("milestones"), _creationTime: v.number(), organizationId: v.string(), projectId: v.string(), title: v.string(), description: v.optional(v.string()),
  dueDate: v.optional(v.string()), status: v.union(v.literal("pending"), v.literal("completed"), v.literal("canceled")), order: v.optional(v.number()),
  createdByUserId: v.string(), createdAt: v.number(), updatedAt: v.number(), completedAt: v.optional(v.number()), deletedAt: v.optional(v.number()),
});

const MAX_COMMERCIAL_RECORDS = 250;

export const listProposals = query({
  args: { organizationId: v.string(), limit: v.optional(v.number()) }, returns: v.array(proposalValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "deal", "read");
    return ctx.db.query("proposals").withIndex("by_org_state_updated", (q) =>
      q.eq("organizationId", args.organizationId).eq("recordState", "active"),
    ).order("desc").take(limit(args.limit));
  },
});

export const listContracts = query({
  args: { organizationId: v.string(), limit: v.optional(v.number()) }, returns: v.array(contractValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "deal", "read");
    return ctx.db.query("contracts").withIndex("by_org_state_updated", (q) =>
      q.eq("organizationId", args.organizationId).eq("recordState", "active"),
    ).order("desc").take(limit(args.limit));
  },
});

export const listEngagements = query({
  args: { organizationId: v.string(), status: v.optional(engagementStatusValidator), limit: v.optional(v.number()) }, returns: v.array(engagementValidator),
  handler: async (ctx, args) => {
    const access = await resolveDeliveryAccess(ctx, args.organizationId);
    const records = args.status
      ? await ctx.db.query("engagements").withIndex("by_org_status_health", (q) => q.eq("organizationId", args.organizationId).eq("status", args.status!)).take(limit(args.limit))
      : await ctx.db.query("engagements").withIndex("by_org_state_updated", (q) => q.eq("organizationId", args.organizationId).eq("recordState", "active")).order("desc").take(limit(args.limit));
    const readable = await Promise.all(records.map(async (record) => ({ record, allowed: await access.canRead(record) })));
    return readable.filter((entry) => entry.allowed).map((entry) => entry.record);
  },
});

export const engagementDetail = query({
  args: { organizationId: v.string(), engagementId: v.id("engagements") },
  returns: v.union(v.object({
    engagement: engagementValidator, projects: v.array(engagementProjectValidator), deliverables: v.array(deliverableValidator),
    milestones: v.array(milestoneValidator), approvals: v.array(approvalValidator), changeOrders: v.array(changeOrderValidator), concerns: v.array(concernValidator),
  }), v.null()),
  handler: async (ctx, args) => {
    const access = await resolveDeliveryAccess(ctx, args.organizationId);
    const engagement = await ctx.db.get(args.engagementId);
    if (!engagement || engagement.organizationId !== args.organizationId || engagement.deletedAt || !await access.canRead(engagement)) return null;
    const projects = await ctx.db.query("engagementProjects").withIndex("by_engagement_project", (q) => q.eq("organizationId", args.organizationId).eq("engagementId", engagement._id)).collect();
    const activeProjects = projects.filter((record) => !record.deletedAt);
    const [deliverables, approvals, changeOrders, concerns, milestonePages] = await Promise.all([
      ctx.db.query("deliverables").withIndex("by_engagement_status", (q) => q.eq("organizationId", args.organizationId).eq("engagementId", engagement._id)).collect(),
      ctx.db.query("deliveryApprovals").withIndex("by_engagement_status", (q) => q.eq("organizationId", args.organizationId).eq("engagementId", engagement._id)).collect(),
      ctx.db.query("changeOrders").withIndex("by_engagement_status", (q) => q.eq("organizationId", args.organizationId).eq("engagementId", engagement._id)).collect(),
      ctx.db.query("deliveryConcerns").withIndex("by_engagement_type_status", (q) => q.eq("organizationId", args.organizationId).eq("engagementId", engagement._id)).collect(),
      Promise.all(activeProjects.map((link) => ctx.db.query("milestones").withIndex("by_project_id", (q) => q.eq("organizationId", args.organizationId).eq("projectId", String(link.projectId))).collect())),
    ]);
    return {
      engagement,
      projects: activeProjects,
      deliverables: deliverables.filter((record) => !record.deletedAt).sort((a, b) => b.updatedAt - a.updatedAt),
      milestones: milestonePages.flat().filter((record) => !record.deletedAt).sort((a, b) => b.updatedAt - a.updatedAt),
      approvals: approvals.sort((a, b) => b.updatedAt - a.updatedAt),
      changeOrders: changeOrders.filter((record) => !record.deletedAt).sort((a, b) => b.updatedAt - a.updatedAt),
      concerns: concerns.filter((record) => !record.deletedAt).sort((a, b) => b.updatedAt - a.updatedAt),
    };
  },
});

function limit(value?: number) { return Math.min(MAX_COMMERCIAL_RECORDS, Math.max(1, Math.trunc(value ?? 100))); }
