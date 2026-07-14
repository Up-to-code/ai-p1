import { ConvexError, v } from "convex/values";
import { mutation, type MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { resourcePlanningAccess } from "./access";
import { assertInterval } from "./capacity";
import { principalTypeValidator } from "./validators";

const intervalArgs = { startAt: v.number(), endAt: v.number() };
const principalArgs = { principalType: principalTypeValidator, principalId: v.string() };

export const createSkill = mutation({
  args: { organizationId: v.string(), name: v.string(), category: v.optional(v.string()) }, returns: v.id("resourceSkills"),
  handler: async (ctx, args) => {
    const access = await resourcePlanningAccess(ctx, args.organizationId); await access.assertManageOrganization();
    const name = text(args.name, "Skill name"); const nameKey = name.normalize("NFKC").toLocaleLowerCase();
    const existing = await ctx.db.query("resourceSkills").withIndex("by_org_active_name", (q) => q.eq("organizationId", args.organizationId).eq("active", true).eq("nameKey", nameKey)).unique();
    if (existing) return existing._id;
    const now = Date.now(); return ctx.db.insert("resourceSkills", { organizationId: args.organizationId, name, nameKey, category: args.category?.trim(), active: true, createdByUserId: access.actor.userId, createdAt: now, updatedAt: now });
  },
});

export const createContractor = mutation({
  args: { organizationId: v.string(), name: v.string(), role: v.optional(v.string()), defaultWeeklyMinutes: v.number() }, returns: v.id("resourceContractors"),
  handler: async (ctx, args) => {
    const access = await resourcePlanningAccess(ctx, args.organizationId); await access.assertManageOrganization(); positiveMinutes(args.defaultWeeklyMinutes);
    const now = Date.now(); return ctx.db.insert("resourceContractors", { organizationId: args.organizationId, name: text(args.name, "Contractor name"), role: args.role?.trim(), defaultWeeklyMinutes: args.defaultWeeklyMinutes, status: "active", createdByUserId: access.actor.userId, createdAt: now, updatedAt: now });
  },
});

export const assignSkill = mutation({
  args: { organizationId: v.string(), ...principalArgs, skillId: v.id("resourceSkills"), level: v.number() }, returns: v.id("resourceSkillAssignments"),
  handler: async (ctx, args) => {
    const access = await resourcePlanningAccess(ctx, args.organizationId); await access.assertManageOrganization(); await access.assertPrincipal(args.principalType, args.principalId);
    if (!Number.isInteger(args.level) || args.level < 1 || args.level > 5) throw domainError("INVALID_SKILL_LEVEL", "Skill level must be an integer from 1 to 5.");
    const skill = await ctx.db.get(args.skillId); if (!skill || skill.organizationId !== args.organizationId || !skill.active) throw domainError("SKILL_NOT_FOUND", "Skill is unavailable.");
    const existing = await ctx.db.query("resourceSkillAssignments").withIndex("by_principal_skill", (q) => q.eq("organizationId", args.organizationId).eq("principalType", args.principalType).eq("principalId", args.principalId).eq("skillId", args.skillId)).unique();
    const now = Date.now();
    if (existing) { await ctx.db.patch(existing._id, { level: args.level, deletedAt: undefined, updatedAt: now }); return existing._id; }
    return ctx.db.insert("resourceSkillAssignments", { organizationId: args.organizationId, principalType: args.principalType, principalId: args.principalId, skillId: args.skillId, level: args.level, createdByUserId: access.actor.userId, createdAt: now, updatedAt: now });
  },
});

export const setCapacity = mutation({
  args: { organizationId: v.string(), ...principalArgs, ...intervalArgs, availableMinutes: v.number(), note: v.optional(v.string()) }, returns: v.id("resourceCapacityPeriods"),
  handler: async (ctx, args) => {
    const access = await resourcePlanningAccess(ctx, args.organizationId); await access.assertManageOrganization(); await access.assertPrincipal(args.principalType, args.principalId); interval(args.startAt, args.endAt); nonnegativeMinutes(args.availableMinutes);
    const existing = (await ctx.db.query("resourceCapacityPeriods").withIndex("by_principal_start", (q) => q.eq("organizationId", args.organizationId).eq("principalType", args.principalType).eq("principalId", args.principalId).eq("startAt", args.startAt)).collect()).find((item) => !item.deletedAt && item.endAt === args.endAt);
    const now = Date.now();
    if (existing) { await ctx.db.patch(existing._id, { availableMinutes: args.availableMinutes, note: args.note?.trim(), updatedAt: now }); return existing._id; }
    return ctx.db.insert("resourceCapacityPeriods", { organizationId: args.organizationId, principalType: args.principalType, principalId: args.principalId, startAt: args.startAt, endAt: args.endAt, availableMinutes: args.availableMinutes, note: args.note?.trim(), createdByUserId: access.actor.userId, createdAt: now, updatedAt: now });
  },
});

export const allocateResource = mutation({
  args: { organizationId: v.string(), ...principalArgs, projectId: v.optional(v.id("projects")), engagementId: v.optional(v.id("engagements")), ...intervalArgs, allocatedMinutes: v.number(), billable: v.boolean(), rateCardId: v.optional(v.id("resourceRateCards")), scenarioId: v.optional(v.id("resourceScenarios")) }, returns: v.id("resourceAllocations"),
  handler: async (ctx, args) => {
    const access = await resourcePlanningAccess(ctx, args.organizationId); await access.assertPrincipal(args.principalType, args.principalId); interval(args.startAt, args.endAt); positiveMinutes(args.allocatedMinutes);
    if (!args.projectId && !args.engagementId) throw domainError("RESOURCE_SCOPE_REQUIRED", "An allocation requires a Project or Engagement.");
    if (args.projectId) await access.assertProject(args.projectId, "update"); if (args.engagementId) await access.assertEngagement(args.engagementId, "update");
    if (args.rateCardId) await requireRateCard(ctx, args.rateCardId, args.organizationId);
    if (args.scenarioId) await requireScenario(ctx, args.scenarioId, args.organizationId);
    const now = Date.now(); const id = await ctx.db.insert("resourceAllocations", { ...args, status: args.scenarioId ? "planned" : "confirmed", createdByUserId: access.actor.userId, createdAt: now, updatedAt: now });
    await audit(ctx, args.organizationId, access.actor.userId, "resource.allocation.create", id, `Allocated ${args.allocatedMinutes} minutes.`); return id;
  },
});

export const requestLeave = mutation({
  args: { organizationId: v.string(), ...principalArgs, ...intervalArgs, unavailableMinutes: v.number(), reason: v.optional(v.string()) }, returns: v.id("resourceLeavePeriods"),
  handler: async (ctx, args) => {
    const access = await resourcePlanningAccess(ctx, args.organizationId); await access.assertPrincipal(args.principalType, args.principalId); interval(args.startAt, args.endAt); positiveMinutes(args.unavailableMinutes);
    if (!access.administrator && (args.principalType !== "user" || args.principalId !== access.actor.userId)) throw domainError("LEAVE_ACCESS_DENIED", "Members can request leave only for themselves.");
    const now = Date.now(); return ctx.db.insert("resourceLeavePeriods", { organizationId: args.organizationId, principalType: args.principalType, principalId: args.principalId, startAt: args.startAt, endAt: args.endAt, unavailableMinutes: args.unavailableMinutes, reason: args.reason?.trim(), status: access.administrator ? "approved" : "requested", decidedByUserId: access.administrator ? access.actor.userId : undefined, decidedAt: access.administrator ? now : undefined, createdByUserId: access.actor.userId, createdAt: now, updatedAt: now });
  },
});

export const cancelAllocation = mutation({
  args: { organizationId: v.string(), allocationId: v.id("resourceAllocations") }, returns: v.null(),
  handler: async (ctx, args) => {
    const access = await resourcePlanningAccess(ctx, args.organizationId);
    const allocation = await ctx.db.get(args.allocationId); if (!allocation || allocation.organizationId !== args.organizationId || allocation.deletedAt || allocation.status === "cancelled") throw domainError("ALLOCATION_NOT_ACTIVE", "Allocation is not active.");
    if (allocation.projectId) await access.assertProject(allocation.projectId, "update"); if (allocation.engagementId) await access.assertEngagement(allocation.engagementId, "update");
    await ctx.db.patch(allocation._id, { status: "cancelled", updatedAt: Date.now() }); await audit(ctx, args.organizationId, access.actor.userId, "resource.allocation.cancel", allocation._id, "Cancelled resource allocation."); return null;
  },
});

export const decideLeave = mutation({
  args: { organizationId: v.string(), leaveId: v.id("resourceLeavePeriods"), decision: v.union(v.literal("approved"), v.literal("rejected")) }, returns: v.null(),
  handler: async (ctx, args) => {
    const access = await resourcePlanningAccess(ctx, args.organizationId); await access.assertManageOrganization();
    const leave = await ctx.db.get(args.leaveId); if (!leave || leave.organizationId !== args.organizationId || leave.status !== "requested") throw domainError("LEAVE_NOT_PENDING", "Leave request is no longer pending.");
    const now = Date.now(); await ctx.db.patch(leave._id, { status: args.decision, decidedByUserId: access.actor.userId, decidedAt: now, updatedAt: now }); return null;
  },
});

export const createRateCard = mutation({
  args: { organizationId: v.string(), name: v.string(), currency: v.string(), effectiveFrom: v.number() }, returns: v.id("resourceRateCards"),
  handler: async (ctx, args) => { const access = await resourcePlanningAccess(ctx, args.organizationId); await access.assertManageOrganization(); const now = Date.now(); return ctx.db.insert("resourceRateCards", { organizationId: args.organizationId, name: text(args.name, "Rate card name"), currency: currency(args.currency), scope: "organization", active: true, effectiveFrom: args.effectiveFrom, createdByUserId: access.actor.userId, createdAt: now, updatedAt: now }); },
});

export const addRateCardEntry = mutation({
  args: { organizationId: v.string(), rateCardId: v.id("resourceRateCards"), principalType: v.optional(principalTypeValidator), principalId: v.optional(v.string()), skillId: v.optional(v.id("resourceSkills")), serviceKey: v.optional(v.string()), costRateMinor: v.number(), billRateMinor: v.number() }, returns: v.id("resourceRateCardEntries"),
  handler: async (ctx, args) => {
    const access = await resourcePlanningAccess(ctx, args.organizationId); await access.assertManageOrganization(); await requireRateCard(ctx, args.rateCardId, args.organizationId); nonnegativeMinutes(args.costRateMinor); nonnegativeMinutes(args.billRateMinor);
    if (!args.principalId && !args.skillId && !args.serviceKey?.trim()) throw domainError("RATE_ENTRY_SELECTOR_REQUIRED", "A rate entry requires a principal, Skill, or service key.");
    if (args.principalId && !args.principalType) throw domainError("RATE_ENTRY_PRINCIPAL_INVALID", "Principal type is required with principal ID.");
    const now = Date.now(); return ctx.db.insert("resourceRateCardEntries", { ...args, serviceKey: args.serviceKey?.trim(), createdByUserId: access.actor.userId, createdAt: now, updatedAt: now });
  },
});

export const createHiringDemand = mutation({
  args: { organizationId: v.string(), projectId: v.optional(v.id("projects")), engagementId: v.optional(v.id("engagements")), title: v.string(), skillId: v.optional(v.id("resourceSkills")), ...intervalArgs, requiredMinutes: v.number() }, returns: v.id("resourceHiringDemands"),
  handler: async (ctx, args) => {
    const access = await resourcePlanningAccess(ctx, args.organizationId); interval(args.startAt, args.endAt); positiveMinutes(args.requiredMinutes); if (!args.projectId && !args.engagementId) throw domainError("RESOURCE_SCOPE_REQUIRED", "Hiring demand requires a Project or Engagement.");
    if (args.projectId) await access.assertProject(args.projectId, "update"); if (args.engagementId) await access.assertEngagement(args.engagementId, "update");
    const now = Date.now(); return ctx.db.insert("resourceHiringDemands", { ...args, title: text(args.title, "Hiring demand title"), status: "open", createdByUserId: access.actor.userId, createdAt: now, updatedAt: now });
  },
});

export const createScenario = mutation({
  args: { organizationId: v.string(), name: v.string(), ...intervalArgs }, returns: v.id("resourceScenarios"),
  handler: async (ctx, args) => { const access = await resourcePlanningAccess(ctx, args.organizationId); await access.assertManageOrganization(); interval(args.startAt, args.endAt); const now = Date.now(); return ctx.db.insert("resourceScenarios", { organizationId: args.organizationId, name: text(args.name, "Scenario name"), status: "draft", baseStartAt: args.startAt, baseEndAt: args.endAt, createdByUserId: access.actor.userId, createdAt: now, updatedAt: now }); },
});

function interval(startAt: number, endAt: number) { try { assertInterval(startAt, endAt); } catch (error) { throw domainError("INVALID_RESOURCE_INTERVAL", error instanceof Error ? error.message : "Invalid resource interval."); } }
function positiveMinutes(value: number) { if (!Number.isSafeInteger(value) || value <= 0) throw domainError("INVALID_MINUTES", "Minutes must be a positive integer."); }
function nonnegativeMinutes(value: number) { if (!Number.isSafeInteger(value) || value < 0) throw domainError("INVALID_AMOUNT", "The value must be a non-negative integer."); }
function text(value: string, name: string) { const normalized = value.trim(); if (!normalized) throw domainError("REQUIRED_TEXT", `${name} is required.`); return normalized; }
function currency(value: string) { const normalized = value.trim().toUpperCase(); if (!/^[A-Z]{3}$/.test(normalized)) throw domainError("INVALID_CURRENCY", "Currency must be a three-letter ISO code."); return normalized; }
function domainError(code: string, message: string) { return new ConvexError({ code, message }); }
async function requireRateCard(ctx: MutationCtx, id: Id<"resourceRateCards">, organizationId: string) { const record = await ctx.db.get(id); if (!record || record.organizationId !== organizationId || record.deletedAt) throw domainError("RESOURCE_RECORD_NOT_FOUND", "Rate card was not found."); return record; }
async function requireScenario(ctx: MutationCtx, id: Id<"resourceScenarios">, organizationId: string) { const record = await ctx.db.get(id); if (!record || record.organizationId !== organizationId || record.deletedAt) throw domainError("RESOURCE_RECORD_NOT_FOUND", "Resource scenario was not found."); return record; }
async function audit(ctx: MutationCtx, organizationId: string, actorUserId: string, action: string, target: string, summary: string) { await ctx.db.insert("organizationAuditEvents", { organizationId, actorUserId, action, target: String(target), summary, createdAt: Date.now() }); }
