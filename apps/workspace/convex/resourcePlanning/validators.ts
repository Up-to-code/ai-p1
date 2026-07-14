import { v } from "convex/values";

export const principalTypeValidator = v.union(v.literal("user"), v.literal("contractor"));
export const allocationStatusValidator = v.union(v.literal("planned"), v.literal("confirmed"), v.literal("cancelled"));
export const leaveStatusValidator = v.union(v.literal("requested"), v.literal("approved"), v.literal("rejected"), v.literal("cancelled"));
export const contractorStatusValidator = v.union(v.literal("active"), v.literal("inactive"), v.literal("archived"));
export const demandStatusValidator = v.union(v.literal("open"), v.literal("staffed"), v.literal("cancelled"));
export const scenarioStatusValidator = v.union(v.literal("draft"), v.literal("active"), v.literal("archived"));
export const rateCardScopeValidator = v.union(v.literal("organization"), v.literal("project"), v.literal("engagement"));

const audit = { createdByUserId: v.string(), createdAt: v.number(), updatedAt: v.number(), deletedAt: v.optional(v.number()) };
const principal = { principalType: principalTypeValidator, principalId: v.string() };
export const skillValidator = v.object({ _id: v.id("resourceSkills"), _creationTime: v.number(), organizationId: v.string(), name: v.string(), nameKey: v.string(), category: v.optional(v.string()), active: v.boolean(), ...audit });
export const contractorValidator = v.object({ _id: v.id("resourceContractors"), _creationTime: v.number(), organizationId: v.string(), name: v.string(), role: v.optional(v.string()), defaultWeeklyMinutes: v.number(), status: contractorStatusValidator, ...audit });
export const capacityPeriodValidator = v.object({ _id: v.id("resourceCapacityPeriods"), _creationTime: v.number(), organizationId: v.string(), ...principal, startAt: v.number(), endAt: v.number(), availableMinutes: v.number(), note: v.optional(v.string()), ...audit });
export const allocationValidator = v.object({ _id: v.id("resourceAllocations"), _creationTime: v.number(), organizationId: v.string(), ...principal, projectId: v.optional(v.id("projects")), engagementId: v.optional(v.id("engagements")), startAt: v.number(), endAt: v.number(), allocatedMinutes: v.number(), status: allocationStatusValidator, billable: v.boolean(), rateCardId: v.optional(v.id("resourceRateCards")), scenarioId: v.optional(v.id("resourceScenarios")), ...audit });
export const leavePeriodValidator = v.object({ _id: v.id("resourceLeavePeriods"), _creationTime: v.number(), organizationId: v.string(), ...principal, startAt: v.number(), endAt: v.number(), unavailableMinutes: v.number(), reason: v.optional(v.string()), status: leaveStatusValidator, decidedByUserId: v.optional(v.string()), decidedAt: v.optional(v.number()), ...audit });
export const rateCardValidator = v.object({ _id: v.id("resourceRateCards"), _creationTime: v.number(), organizationId: v.string(), name: v.string(), currency: v.string(), scope: rateCardScopeValidator, projectId: v.optional(v.id("projects")), engagementId: v.optional(v.id("engagements")), active: v.boolean(), effectiveFrom: v.number(), effectiveTo: v.optional(v.number()), ...audit });
export const hiringDemandValidator = v.object({ _id: v.id("resourceHiringDemands"), _creationTime: v.number(), organizationId: v.string(), projectId: v.optional(v.id("projects")), engagementId: v.optional(v.id("engagements")), title: v.string(), skillId: v.optional(v.id("resourceSkills")), startAt: v.number(), endAt: v.number(), requiredMinutes: v.number(), status: demandStatusValidator, ...audit });
export const scenarioValidator = v.object({ _id: v.id("resourceScenarios"), _creationTime: v.number(), organizationId: v.string(), name: v.string(), status: scenarioStatusValidator, baseStartAt: v.number(), baseEndAt: v.number(), ...audit });
