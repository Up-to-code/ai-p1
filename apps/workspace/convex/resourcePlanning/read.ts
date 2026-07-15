import { v } from "convex/values";
import { query } from "../_generated/server";
import { resourcePlanningAccess } from "./access";
import { capacitySummary } from "./capacity";
import { allocationValidator, capacityPeriodValidator, contractorValidator, hiringDemandValidator, leavePeriodValidator, principalTypeValidator, rateCardValidator, scenarioValidator, skillValidator } from "./validators";

const MAX_ROWS = 1_000;
const summaryValidator = v.object({ capacityMinutes: v.number(), leaveMinutes: v.number(), netCapacityMinutes: v.number(), allocatedMinutes: v.number(), availableMinutes: v.number(), utilizationPercent: v.number() });

export const catalog = query({
  args: { organizationId: v.string() },
  returns: v.object({ skills: v.array(skillValidator), contractors: v.array(contractorValidator), rateCards: v.array(rateCardValidator), scenarios: v.array(scenarioValidator) }),
  handler: async (ctx, args) => {
    await resourcePlanningAccess(ctx, args.organizationId);
    const [skills, contractors, rateCards, scenarios] = await Promise.all([
      ctx.db.query("resourceSkills").withIndex("by_org_active_name", (q) => q.eq("organizationId", args.organizationId).eq("active", true)).take(MAX_ROWS),
      ctx.db.query("resourceContractors").withIndex("by_org_status_name", (q) => q.eq("organizationId", args.organizationId).eq("status", "active")).take(MAX_ROWS),
      ctx.db.query("resourceRateCards").withIndex("by_org_active_effective", (q) => q.eq("organizationId", args.organizationId).eq("active", true)).order("desc").take(MAX_ROWS),
      ctx.db.query("resourceScenarios").withIndex("by_org_status_updated", (q) => q.eq("organizationId", args.organizationId).eq("status", "draft")).order("desc").take(MAX_ROWS),
    ]);
    return { skills, contractors, rateCards, scenarios };
  },
});

export const schedule = query({
  args: { organizationId: v.string(), startAt: v.number(), endAt: v.number() },
  returns: v.object({ allocations: v.array(allocationValidator), leave: v.array(leavePeriodValidator), capacity: v.array(capacityPeriodValidator), demands: v.array(hiringDemandValidator) }),
  handler: async (ctx, args) => {
    const access = await resourcePlanningAccess(ctx, args.organizationId);
    const [allocationCandidates, approvedLeave, requestedLeave, capacityCandidates, demandCandidates] = await Promise.all([
      ctx.db.query("resourceAllocations").withIndex("by_org_status_start", (q) => q.eq("organizationId", args.organizationId).eq("status", "confirmed").lte("startAt", args.endAt)).take(MAX_ROWS),
      ctx.db.query("resourceLeavePeriods").withIndex("by_org_status_start", (q) => q.eq("organizationId", args.organizationId).eq("status", "approved").lte("startAt", args.endAt)).take(MAX_ROWS),
      ctx.db.query("resourceLeavePeriods").withIndex("by_org_status_start", (q) => q.eq("organizationId", args.organizationId).eq("status", "requested").lte("startAt", args.endAt)).take(MAX_ROWS),
      ctx.db.query("resourceCapacityPeriods").withIndex("by_org_start", (q) => q.eq("organizationId", args.organizationId).lte("startAt", args.endAt)).take(MAX_ROWS),
      ctx.db.query("resourceHiringDemands").withIndex("by_org_status_start", (q) => q.eq("organizationId", args.organizationId).eq("status", "open").lte("startAt", args.endAt)).take(MAX_ROWS),
    ]);
    const overlapping = <T extends { startAt: number; endAt: number; deletedAt?: number }>(rows: T[]) => rows.filter((row) => !row.deletedAt && row.endAt > args.startAt);
    const allocations = [];
    for (const allocation of overlapping(allocationCandidates)) {
      if (allocation.projectId) { try { await access.assertProject(allocation.projectId, "read"); } catch { continue; } }
      if (allocation.engagementId) { try { await access.assertEngagement(allocation.engagementId, "read"); } catch { continue; } }
      allocations.push(allocation);
    }
    const demands = [];
    for (const demand of overlapping(demandCandidates)) {
      try { if (demand.projectId) await access.assertProject(demand.projectId, "read"); if (demand.engagementId) await access.assertEngagement(demand.engagementId, "read"); demands.push(demand); } catch { continue; }
    }
    const leaveCandidates = [...approvedLeave, ...requestedLeave];
    return { allocations, leave: access.administrator ? overlapping(leaveCandidates) : overlapping(leaveCandidates).filter((item) => item.principalType === "user" && item.principalId === access.actor.userId), capacity: access.administrator ? overlapping(capacityCandidates) : overlapping(capacityCandidates).filter((item) => item.principalType === "user" && item.principalId === access.actor.userId), demands };
  },
});

export const principalAvailability = query({
  args: { organizationId: v.string(), principalType: principalTypeValidator, principalId: v.string(), startAt: v.number(), endAt: v.number() },
  returns: summaryValidator,
  handler: async (ctx, args) => {
    const access = await resourcePlanningAccess(ctx, args.organizationId); await access.assertPrincipal(args.principalType, args.principalId);
    if (!access.administrator && !(args.principalType === "user" && args.principalId === access.actor.userId)) throw new Error("Availability can be read only by the principal or a resource administrator.");
    const [capacity, leave, allocations] = await Promise.all([
      ctx.db.query("resourceCapacityPeriods").withIndex("by_principal_start", (q) => q.eq("organizationId", args.organizationId).eq("principalType", args.principalType).eq("principalId", args.principalId).lte("startAt", args.endAt)).take(MAX_ROWS),
      ctx.db.query("resourceLeavePeriods").withIndex("by_principal_start", (q) => q.eq("organizationId", args.organizationId).eq("principalType", args.principalType).eq("principalId", args.principalId).lte("startAt", args.endAt)).take(MAX_ROWS),
      ctx.db.query("resourceAllocations").withIndex("by_principal_start", (q) => q.eq("organizationId", args.organizationId).eq("principalType", args.principalType).eq("principalId", args.principalId).lte("startAt", args.endAt)).take(MAX_ROWS),
    ]);
    return capacitySummary({ startAt: args.startAt, endAt: args.endAt, capacity: capacity.filter(activeOverlap(args)).map((item) => ({ ...item, minutes: item.availableMinutes })), leave: leave.filter((item) => item.status === "approved").filter(activeOverlap(args)).map((item) => ({ ...item, minutes: item.unavailableMinutes })), allocations: allocations.filter((item) => item.status === "confirmed").filter(activeOverlap(args)).map((item) => ({ ...item, minutes: item.allocatedMinutes })) });
  },
});

export const overview = query({
  args: { organizationId: v.string(), startAt: v.number(), endAt: v.number() },
  returns: v.object({ activeContractors: v.number(), skills: v.number(), openDemands: v.number(), pendingLeave: v.number(), allocatedMinutes: v.number(), capacityMinutes: v.number(), utilizationPercent: v.number() }),
  handler: async (ctx, args) => {
    const access = await resourcePlanningAccess(ctx, args.organizationId);
    const [contractors, skills, demands, leave, allocations, capacity] = await Promise.all([
      ctx.db.query("resourceContractors").withIndex("by_org_status_name", (q) => q.eq("organizationId", args.organizationId).eq("status", "active")).collect(),
      ctx.db.query("resourceSkills").withIndex("by_org_active_name", (q) => q.eq("organizationId", args.organizationId).eq("active", true)).collect(),
      ctx.db.query("resourceHiringDemands").withIndex("by_org_status_start", (q) => q.eq("organizationId", args.organizationId).eq("status", "open").lte("startAt", args.endAt)).take(MAX_ROWS),
      ctx.db.query("resourceLeavePeriods").withIndex("by_org_status_start", (q) => q.eq("organizationId", args.organizationId).eq("status", "requested").lte("startAt", args.endAt)).take(MAX_ROWS),
      ctx.db.query("resourceAllocations").withIndex("by_org_status_start", (q) => q.eq("organizationId", args.organizationId).eq("status", "confirmed").lte("startAt", args.endAt)).take(MAX_ROWS),
      ctx.db.query("resourceCapacityPeriods").withIndex("by_org_start", (q) => q.eq("organizationId", args.organizationId).lte("startAt", args.endAt)).take(MAX_ROWS),
    ]);
    const readableAllocations = [];
    for (const allocation of allocations.filter(activeOverlap(args))) { try { if (allocation.projectId) await access.assertProject(allocation.projectId, "read"); if (allocation.engagementId) await access.assertEngagement(allocation.engagementId, "read"); readableAllocations.push(allocation); } catch { continue; } }
    const readableDemands = [];
    for (const demand of demands.filter(activeOverlap(args))) { try { if (demand.projectId) await access.assertProject(demand.projectId, "read"); if (demand.engagementId) await access.assertEngagement(demand.engagementId, "read"); readableDemands.push(demand); } catch { continue; } }
    const visibleCapacity = access.administrator ? capacity : capacity.filter((item) => item.principalType === "user" && item.principalId === access.actor.userId);
    const summary = capacitySummary({ startAt: args.startAt, endAt: args.endAt, capacity: visibleCapacity.filter(activeOverlap(args)).map((item) => ({ ...item, minutes: item.availableMinutes })), leave: [], allocations: readableAllocations.map((item) => ({ ...item, minutes: item.allocatedMinutes })) });
    const visiblePendingLeave = access.administrator ? leave : leave.filter((item) => item.principalType === "user" && item.principalId === access.actor.userId);
    return { activeContractors: contractors.length, skills: skills.length, openDemands: readableDemands.length, pendingLeave: visiblePendingLeave.filter(activeOverlap(args)).length, allocatedMinutes: summary.allocatedMinutes, capacityMinutes: summary.capacityMinutes, utilizationPercent: summary.utilizationPercent };
  },
});

function activeOverlap(window: { startAt: number; endAt: number }) { return (row: { startAt: number; endAt: number; deletedAt?: number }) => !row.deletedAt && row.startAt < window.endAt && row.endAt > window.startAt; }
