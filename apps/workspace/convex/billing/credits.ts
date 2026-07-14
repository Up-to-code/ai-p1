import { creditsForProviderCost, normalizeBillingPlanKey } from "@qentrah/domain-contracts/subscription-pricing";
import { v } from "convex/values";
import type { MutationCtx } from "../_generated/server";
import { mutation, query } from "../_generated/server";
import { getAuthUser } from "../auth";
import { assertOrganizationPermission } from "../organizations/profile/access";
import { resolveOrganizationEntitlements } from "./access";

function monthlyWindow(now: number) {
  const date = new Date(now);
  return {
    start: Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1),
    end: Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1),
  };
}

async function ensureCurrentBalance(ctx: MutationCtx, organizationId: string, now: number) {
  const [subscription, entitlements, existing] = await Promise.all([
    ctx.db.query("organizationSubscriptions").withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId)).unique(),
    resolveOrganizationEntitlements(ctx, organizationId, now),
    ctx.db.query("organizationCreditBalances").withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId)).unique(),
  ]);
  const window = monthlyWindow(now);
  const planId = normalizeBillingPlanKey(subscription?.planId ?? "free");
  if (!existing) {
    const id = await ctx.db.insert("organizationCreditBalances", {
      organizationId,
      planId,
      subscriptionCreditsGranted: entitlements.includedCredits,
      subscriptionCreditsUsed: 0,
      addOnCreditsGranted: 0,
      addOnCreditsUsed: 0,
      reservedCredits: 0,
      currentPeriodStartAt: window.start,
      currentPeriodEndAt: window.end,
      updatedAt: now,
    });
    return (await ctx.db.get(id))!;
  }
  const windowChanged = existing.currentPeriodStartAt !== window.start || existing.currentPeriodEndAt !== window.end;
  const grantChanged = existing.subscriptionCreditsGranted !== entitlements.includedCredits || existing.planId !== planId;
  if (windowChanged || grantChanged) {
    await ctx.db.patch(existing._id, {
      planId,
      subscriptionCreditsGranted: entitlements.includedCredits,
      subscriptionCreditsUsed: windowChanged ? 0 : Math.min(existing.subscriptionCreditsUsed, entitlements.includedCredits),
      currentPeriodStartAt: window.start,
      currentPeriodEndAt: window.end,
      updatedAt: now,
    });
    return (await ctx.db.get(existing._id))!;
  }
  return existing;
}

function remaining(balance: {
  subscriptionCreditsGranted: number;
  subscriptionCreditsUsed: number;
  addOnCreditsGranted: number;
  addOnCreditsUsed: number;
  reservedCredits?: number;
}) {
  const subscription = Math.max(0, balance.subscriptionCreditsGranted - balance.subscriptionCreditsUsed);
  const purchased = Math.max(0, balance.addOnCreditsGranted - balance.addOnCreditsUsed);
  const reserved = Math.max(0, balance.reservedCredits ?? 0);
  return { subscription, purchased, reserved, spendable: Math.max(0, subscription + purchased - reserved) };
}

const reservationResult = v.object({
  allowed: v.boolean(),
  reason: v.optional(v.union(v.literal("AI_UNAVAILABLE"), v.literal("INSUFFICIENT_CREDITS"))),
  reservationId: v.optional(v.id("organizationCreditReservations")),
  reservedCredits: v.number(),
  spendableCredits: v.number(),
});

/** Reserves worst-case AI spend before a provider stream starts. */
export const reserveAiCredits = mutation({
  args: {
    organizationId: v.string(),
    runKey: v.string(),
    threadId: v.optional(v.string()),
    modelId: v.string(),
    maximumCredits: v.number(),
  },
  returns: reservationResult,
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    const user = await getAuthUser(ctx);
    const existingReservation = await ctx.db
      .query("organizationCreditReservations")
      .withIndex("by_organization_and_run_key", (q) => q.eq("organizationId", args.organizationId).eq("runKey", args.runKey))
      .unique();
    if (existingReservation) {
      const balance = await ensureCurrentBalance(ctx, args.organizationId, Date.now());
      return {
        allowed: existingReservation.status === "active",
        reservationId: existingReservation._id,
        reservedCredits: existingReservation.reservedCredits,
        spendableCredits: remaining(balance).spendable,
      };
    }
    const now = Date.now();
    const entitlements = await resolveOrganizationEntitlements(ctx, args.organizationId, now);
    const balance = await ensureCurrentBalance(ctx, args.organizationId, now);
    const available = remaining(balance);
    if (!entitlements.aiAccess) {
      return { allowed: false, reason: "AI_UNAVAILABLE" as const, reservedCredits: 0, spendableCredits: available.spendable };
    }
    const maximumCredits = Math.max(1, Math.ceil(args.maximumCredits));
    if (available.spendable < maximumCredits) {
      return { allowed: false, reason: "INSUFFICIENT_CREDITS" as const, reservedCredits: 0, spendableCredits: available.spendable };
    }
    const reservationId = await ctx.db.insert("organizationCreditReservations", {
      organizationId: args.organizationId,
      runKey: args.runKey,
      threadId: args.threadId,
      actorUserId: user._id,
      modelId: args.modelId,
      status: "active",
      reservedCredits: maximumCredits,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.patch(balance._id, { reservedCredits: available.reserved + maximumCredits, updatedAt: now });
    await ctx.db.insert("organizationCreditLedger", {
      organizationId: args.organizationId,
      kind: "reservation",
      meter: "ai_chat",
      sourceType: "ai_run",
      sourceId: args.runKey,
      reservationId,
      runKey: args.runKey,
      threadId: args.threadId,
      actorUserId: user._id,
      modelId: args.modelId,
      calculatedCredits: maximumCredits,
      requestedCredits: maximumCredits,
      subscriptionCreditsDelta: 0,
      addOnCreditsDelta: 0,
      subscriptionCreditsUsed: 0,
      addOnCreditsUsed: 0,
      balanceAfterSubscriptionCredits: available.subscription,
      balanceAfterAddOnCredits: available.purchased,
      billingPeriodStartAt: balance.currentPeriodStartAt,
      billingPeriodEndAt: balance.currentPeriodEndAt,
      createdAt: now,
    });
    return { allowed: true, reservationId, reservedCredits: maximumCredits, spendableCredits: available.spendable - maximumCredits };
  },
});

export const settleAiCredits = mutation({
  args: {
    organizationId: v.string(),
    runKey: v.string(),
    providerCostUsd: v.optional(v.number()),
    promptTokens: v.optional(v.number()),
    completionTokens: v.optional(v.number()),
  },
  returns: v.object({ settled: v.boolean(), credits: v.number(), subscriptionCreditsUsed: v.number(), addOnCreditsUsed: v.number() }),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    const reservation = await ctx.db
      .query("organizationCreditReservations")
      .withIndex("by_organization_and_run_key", (q) => q.eq("organizationId", args.organizationId).eq("runKey", args.runKey))
      .unique();
    if (!reservation) throw new Error("AI credit reservation was not found.");
    if (reservation.status !== "active") {
      return { settled: false, credits: reservation.settledCredits ?? 0, subscriptionCreditsUsed: 0, addOnCreditsUsed: 0 };
    }
    const now = Date.now();
    const balance = await ensureCurrentBalance(ctx, args.organizationId, now);
    const promptTokens = args.promptTokens ?? reservation.promptTokens;
    const completionTokens = args.completionTokens ?? reservation.completionTokens;
    const measured = args.providerCostUsd === undefined
      ? reservation.reservedCredits
      : creditsForProviderCost(args.providerCostUsd);
    const credits = Math.min(reservation.reservedCredits, Math.max(0, measured));
    const available = remaining(balance);
    const subscriptionCreditsUsed = Math.min(available.subscription, credits);
    const addOnCreditsUsed = Math.max(0, credits - subscriptionCreditsUsed);
    await ctx.db.patch(balance._id, {
      subscriptionCreditsUsed: balance.subscriptionCreditsUsed + subscriptionCreditsUsed,
      addOnCreditsUsed: balance.addOnCreditsUsed + addOnCreditsUsed,
      reservedCredits: Math.max(0, available.reserved - reservation.reservedCredits),
      updatedAt: now,
    });
    await ctx.db.patch(reservation._id, {
      status: "settled",
      settledCredits: credits,
      providerCostUsd: args.providerCostUsd,
      promptTokens,
      completionTokens,
      updatedAt: now,
    });
    await ctx.db.insert("organizationCreditLedger", {
      organizationId: args.organizationId,
      kind: "usage",
      meter: "ai_chat",
      sourceType: "ai_run",
      sourceId: args.runKey,
      reservationId: reservation._id,
      runKey: args.runKey,
      threadId: reservation.threadId,
      actorUserId: reservation.actorUserId,
      providerCostUsd: args.providerCostUsd,
      modelId: reservation.modelId,
      promptTokens,
      completionTokens,
      calculatedCredits: measured,
      requestedCredits: credits,
      subscriptionCreditsDelta: -subscriptionCreditsUsed,
      addOnCreditsDelta: -addOnCreditsUsed,
      subscriptionCreditsUsed,
      addOnCreditsUsed,
      balanceAfterSubscriptionCredits: available.subscription - subscriptionCreditsUsed,
      balanceAfterAddOnCredits: available.purchased - addOnCreditsUsed,
      billingPeriodStartAt: balance.currentPeriodStartAt,
      billingPeriodEndAt: balance.currentPeriodEndAt,
      createdAt: now,
    });
    return { settled: true, credits, subscriptionCreditsUsed, addOnCreditsUsed };
  },
});

export const recordAiStepUsage = mutation({
  args: {
    organizationId: v.string(),
    runKey: v.string(),
    promptTokens: v.optional(v.number()),
    completionTokens: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    const reservation = await ctx.db
      .query("organizationCreditReservations")
      .withIndex("by_organization_and_run_key", (q) => q.eq("organizationId", args.organizationId).eq("runKey", args.runKey))
      .unique();
    if (!reservation || reservation.status !== "active") return null;
    await ctx.db.patch(reservation._id, {
      promptTokens: (reservation.promptTokens ?? 0) + Math.max(0, args.promptTokens ?? 0),
      completionTokens: (reservation.completionTokens ?? 0) + Math.max(0, args.completionTokens ?? 0),
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const releaseAiCredits = mutation({
  args: { organizationId: v.string(), runKey: v.string() },
  returns: v.object({ released: v.boolean(), credits: v.number() }),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    const reservation = await ctx.db
      .query("organizationCreditReservations")
      .withIndex("by_organization_and_run_key", (q) => q.eq("organizationId", args.organizationId).eq("runKey", args.runKey))
      .unique();
    if (!reservation || reservation.status !== "active") return { released: false, credits: 0 };
    const now = Date.now();
    const balance = await ensureCurrentBalance(ctx, args.organizationId, now);
    const current = remaining(balance);
    await ctx.db.patch(balance._id, { reservedCredits: Math.max(0, current.reserved - reservation.reservedCredits), updatedAt: now });
    await ctx.db.patch(reservation._id, { status: "released", updatedAt: now });
    await ctx.db.insert("organizationCreditLedger", {
      organizationId: args.organizationId,
      kind: "release",
      meter: "ai_chat",
      sourceType: "ai_run",
      sourceId: args.runKey,
      reservationId: reservation._id,
      runKey: args.runKey,
      threadId: reservation.threadId,
      actorUserId: reservation.actorUserId,
      modelId: reservation.modelId,
      calculatedCredits: 0,
      requestedCredits: reservation.reservedCredits,
      subscriptionCreditsDelta: 0,
      addOnCreditsDelta: 0,
      subscriptionCreditsUsed: 0,
      addOnCreditsUsed: 0,
      balanceAfterSubscriptionCredits: current.subscription,
      balanceAfterAddOnCredits: current.purchased,
      billingPeriodStartAt: balance.currentPeriodStartAt,
      billingPeriodEndAt: balance.currentPeriodEndAt,
      createdAt: now,
    });
    return { released: true, credits: reservation.reservedCredits };
  },
});

export const getCreditLedger = query({
  args: { organizationId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    return await ctx.db
      .query("organizationCreditLedger")
      .withIndex("by_organization_created", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .take(Math.min(200, Math.max(1, args.limit ?? 50)));
  },
});
