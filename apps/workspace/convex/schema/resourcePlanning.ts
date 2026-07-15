import { defineTable } from "convex/server";
import { v } from "convex/values";
import { allocationStatusValidator, contractorStatusValidator, demandStatusValidator, leaveStatusValidator, principalTypeValidator, rateCardScopeValidator, scenarioStatusValidator } from "../resourcePlanning/validators";

const audit = { createdByUserId: v.string(), createdAt: v.number(), updatedAt: v.number(), deletedAt: v.optional(v.number()) };
const principal = { principalType: principalTypeValidator, principalId: v.string() };

export const resourcePlanningTables = {
  resourceSkills: defineTable({ organizationId: v.string(), name: v.string(), nameKey: v.string(), category: v.optional(v.string()), active: v.boolean(), ...audit })
    .index("by_org_active_name", ["organizationId", "active", "nameKey"]),
  resourceSkillAssignments: defineTable({ organizationId: v.string(), ...principal, skillId: v.id("resourceSkills"), level: v.number(), verifiedByUserId: v.optional(v.string()), ...audit })
    .index("by_principal_skill", ["organizationId", "principalType", "principalId", "skillId"])
    .index("by_skill_principal", ["organizationId", "skillId", "principalType", "principalId"]),
  resourceContractors: defineTable({ organizationId: v.string(), name: v.string(), status: contractorStatusValidator, role: v.optional(v.string()), defaultWeeklyMinutes: v.number(), ...audit })
    .index("by_org_status_name", ["organizationId", "status", "name"]),
  resourceCapacityPeriods: defineTable({ organizationId: v.string(), ...principal, startAt: v.number(), endAt: v.number(), availableMinutes: v.number(), note: v.optional(v.string()), ...audit })
    .index("by_principal_start", ["organizationId", "principalType", "principalId", "startAt"])
    .index("by_org_start", ["organizationId", "startAt"]),
  resourceAllocations: defineTable({ organizationId: v.string(), ...principal, projectId: v.optional(v.id("projects")), engagementId: v.optional(v.id("engagements")), startAt: v.number(), endAt: v.number(), allocatedMinutes: v.number(), status: allocationStatusValidator, billable: v.boolean(), rateCardId: v.optional(v.id("resourceRateCards")), scenarioId: v.optional(v.id("resourceScenarios")), ...audit })
    .index("by_principal_start", ["organizationId", "principalType", "principalId", "startAt"])
    .index("by_project_start", ["organizationId", "projectId", "startAt"])
    .index("by_engagement_start", ["organizationId", "engagementId", "startAt"])
    .index("by_org_status_start", ["organizationId", "status", "startAt"]),
  resourceLeavePeriods: defineTable({ organizationId: v.string(), ...principal, startAt: v.number(), endAt: v.number(), unavailableMinutes: v.number(), reason: v.optional(v.string()), status: leaveStatusValidator, decidedByUserId: v.optional(v.string()), decidedAt: v.optional(v.number()), ...audit })
    .index("by_principal_start", ["organizationId", "principalType", "principalId", "startAt"])
    .index("by_org_status_start", ["organizationId", "status", "startAt"]),
  resourceRateCards: defineTable({ organizationId: v.string(), name: v.string(), currency: v.string(), scope: rateCardScopeValidator, projectId: v.optional(v.id("projects")), engagementId: v.optional(v.id("engagements")), active: v.boolean(), effectiveFrom: v.number(), effectiveTo: v.optional(v.number()), ...audit })
    .index("by_org_active_effective", ["organizationId", "active", "effectiveFrom"]),
  resourceRateCardEntries: defineTable({ organizationId: v.string(), rateCardId: v.id("resourceRateCards"), principalType: v.optional(principalTypeValidator), principalId: v.optional(v.string()), skillId: v.optional(v.id("resourceSkills")), serviceKey: v.optional(v.string()), costRateMinor: v.number(), billRateMinor: v.number(), ...audit })
    .index("by_rate_card", ["organizationId", "rateCardId"]),
  resourceHiringDemands: defineTable({ organizationId: v.string(), projectId: v.optional(v.id("projects")), engagementId: v.optional(v.id("engagements")), title: v.string(), skillId: v.optional(v.id("resourceSkills")), startAt: v.number(), endAt: v.number(), requiredMinutes: v.number(), status: demandStatusValidator, ...audit })
    .index("by_org_status_start", ["organizationId", "status", "startAt"])
    .index("by_project_start", ["organizationId", "projectId", "startAt"]),
  resourceScenarios: defineTable({ organizationId: v.string(), name: v.string(), status: scenarioStatusValidator, baseStartAt: v.number(), baseEndAt: v.number(), ...audit })
    .index("by_org_status_updated", ["organizationId", "status", "updatedAt"]),
};
