import {
  decideEntitlement,
  resolveOrganizationEntitlements as resolveContractEntitlements,
  subscriptionPlanIdForBillingKey,
  type EnterpriseEntitlementOverrides,
  type EntitlementKey,
  type OrganizationEntitlements,
} from "@qentrah/domain-contracts/subscription-pricing";
import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, query } from "../_generated/server";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { components } from "../_generated/api";
import { getAuthUser } from "../auth";
import { getOrganizationRole } from "../permissions";
import { assertOrganizationPermission } from "../organizations/profile/access";
import { organizationEntitlementsValidator } from "./validators";

type BillingCtx = QueryCtx | MutationCtx;

async function findSubscription(ctx: BillingCtx, organizationId: string) {
  return await ctx.db
    .query("organizationSubscriptions")
    .withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId))
    .unique();
}

function normalizeEnterpriseOverrides(value: unknown): EnterpriseEntitlementOverrides | undefined {
  if (!value || typeof value !== "object") return undefined;
  return value as EnterpriseEntitlementOverrides;
}

/** Resolves the effective plan at request time, including cancellation and grace windows. */
export async function resolveOrganizationEntitlements(
  ctx: BillingCtx,
  organizationId: string,
  now = Date.now(),
): Promise<OrganizationEntitlements> {
  const subscription = await findSubscription(ctx, organizationId);
  if (!subscription) return resolveContractEntitlements({ now });
  return resolveContractEntitlements({
    planId: subscriptionPlanIdForBillingKey(subscription.planId),
    status: subscription.status,
    currentPeriodEndAt: subscription.currentPeriodEndAt,
    graceEndsAt: subscription.graceEndsAt,
    trialEndsAt: subscription.trialEndsAt,
    enterpriseOverrides: normalizeEnterpriseOverrides(subscription.enterpriseOverrides),
    now,
  });
}

/** Enforces a plan limit after record-level authorization has succeeded. */
export async function assertOrganizationEntitlement(
  ctx: BillingCtx,
  input: {
    organizationId: string;
    key: EntitlementKey;
    used?: number;
    requestedUnits?: number;
  },
) {
  const entitlements = await resolveOrganizationEntitlements(ctx, input.organizationId);
  const decision = decideEntitlement({
    entitlements,
    key: input.key,
    used: input.used,
    requestedUnits: input.requestedUnits,
  });
  if (!decision.allowed) {
    throw new ConvexError({
      code: "PLAN_ENTITLEMENT_REQUIRED",
      message: decision.reason === "AI_UNAVAILABLE"
        ? "AI is not available on the current organization plan."
        : "The organization has reached its plan limit.",
      organizationId: input.organizationId,
      entitlement: input.key,
      limit: decision.limit,
      used: decision.used,
    });
  }
  return { entitlements, decision };
}

export async function countActiveProjects(ctx: BillingCtx, organizationId: string, limit = 6) {
  const projects = await ctx.db
    .query("projects")
    .withIndex("by_org_state_updated", (q) => q.eq("organizationId", organizationId).eq("recordState", "active"))
    .take(limit);
  return projects.length;
}

export async function countOrganizationMembers(ctx: BillingCtx, organizationId: string, limit = 100) {
  const result = await ctx.runQuery(components.betterAuth.adapter.findMany, {
    model: "member",
    paginationOpts: { cursor: null, numItems: limit },
    where: [{ field: "organizationId", value: organizationId }],
  }) as { page?: unknown[] } | unknown[];
  return Array.isArray(result) ? result.length : (result.page?.length ?? 0);
}

function currentMonthlyWindowStart(now: number) {
  const date = new Date(now);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
}

/** Atomically consumes a monthly quota so concurrent adapters cannot overspend it. */
export async function consumeOrganizationEntitlement(
  ctx: MutationCtx,
  input: { organizationId: string; key: EntitlementKey; units?: number; now?: number },
) {
  const now = input.now ?? Date.now();
  const windowStartAt = currentMonthlyWindowStart(now);
  const existing = await ctx.db
    .query("organizationEntitlementUsage")
    .withIndex("by_organization_and_entitlement_and_window", (q) =>
      q.eq("organizationId", input.organizationId)
        .eq("entitlement", input.key)
        .eq("windowStartAt", windowStartAt),
    )
    .unique();
  const units = Math.max(1, Math.floor(input.units ?? 1));
  const result = await assertOrganizationEntitlement(ctx, {
    organizationId: input.organizationId,
    key: input.key,
    used: existing?.used ?? 0,
    requestedUnits: units,
  });
  if (existing) {
    await ctx.db.patch(existing._id, { used: existing.used + units, updatedAt: now });
  } else {
    await ctx.db.insert("organizationEntitlementUsage", {
      organizationId: input.organizationId,
      entitlement: input.key,
      windowStartAt,
      used: units,
      updatedAt: now,
    });
  }
  return result;
}

export const getOrganizationEntitlements = query({
  args: { organizationId: v.string() },
  returns: v.object({
    entitlements: organizationEntitlementsValidator,
    canManageBilling: v.boolean(),
    usage: v.object({ projects: v.number(), members: v.number() }),
  }),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    const user = await getAuthUser(ctx);
    const [entitlements, role, projects, members] = await Promise.all([
      resolveOrganizationEntitlements(ctx, args.organizationId),
      getOrganizationRole(ctx, args.organizationId, user._id),
      countActiveProjects(ctx, args.organizationId),
      countOrganizationMembers(ctx, args.organizationId),
    ]);
    return {
      entitlements,
      canManageBilling: role === "owner",
      usage: { projects, members },
    };
  },
});

export const assertEntitlementForAuthorizedRequest = mutation({
  args: {
    organizationId: v.string(),
    key: v.union(
      v.literal("member"), v.literal("project"), v.literal("storage_bytes"), v.literal("guest"),
      v.literal("webhook"), v.literal("automation_run"), v.literal("api_call"), v.literal("agent_link"),
      v.literal("ai"), v.literal("custom_role"), v.literal("sso"),
    ),
    used: v.optional(v.number()),
    requestedUnits: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    await assertOrganizationEntitlement(ctx, args);
    return null;
  },
});

export const consumeApiCallFromMcp = internalMutation({
  args: { organizationId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await consumeOrganizationEntitlement(ctx, { organizationId: args.organizationId, key: "api_call", units: 1 });
    return null;
  },
});
