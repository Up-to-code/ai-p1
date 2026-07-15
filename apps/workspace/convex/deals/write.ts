import { v } from "convex/values";
import { internalMutation, mutation } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { getAuthUser } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { dealInputValidator, dealValidator } from "./validators";

export type DealInput = {
  title: string;
  clientId?: Id<"clients">;
  projectId?: Id<"projects">;
  stage: "lead" | "qualified" | "proposal_sent" | "contract_sent" | "won" | "lost";
  status: "open" | "won" | "lost" | "paused";
  value?: number;
  currency?: string;
  dealThinking?: string;
  source?: string;
  priority: "low" | "normal" | "high" | "urgent";
  closeDate?: string;
  nextStep?: string;
  ownerUserId?: string;
  tags?: string[];
};

function presentDeal<TDeal extends { _id: string }>(deal: TDeal) {
  return { ...deal, id: deal._id };
}

async function createDealCore(ctx: MutationCtx, args: { organizationId: string; input: DealInput; actorUserId: string }) {
  const now = Date.now();
  const ownerUserId = args.input.ownerUserId ?? args.actorUserId;
  const id = await ctx.db.insert("deals", {
    organizationId: args.organizationId,
    ...args.input,
    ownerUserId,
    recordState: "active",
    createdByUserId: args.actorUserId,
    createdAt: now,
    updatedAt: now,
    ...(args.input.status === "won" || args.input.status === "lost" ? { closedAt: now } : {}),
  });

  const deal = await ctx.db.get(id);
  if (!deal) throw new Error("Deal could not be created.");
  return { presented: presentDeal(deal), now };
}

/** Canonical Deal creation Interface for another domain command in the same transaction. */
export async function createDealFromDomainCommand(
  ctx: MutationCtx,
  args: { organizationId: string; input: DealInput; actorUserId: string; auditSummary: string },
) {
  const { presented, now } = await createDealCore(ctx, args);
  await ctx.db.insert("organizationAuditEvents", {
    organizationId: args.organizationId,
    actorUserId: args.actorUserId,
    action: "deal.create",
    target: presented.id,
    summary: args.auditSummary,
    createdAt: now,
  });
  return presented;
}

async function updateDealCore(ctx: MutationCtx, args: { organizationId: string; dealId: Id<"deals">; input: DealInput; actorUserId: string }) {
  const existing = await ctx.db.get(args.dealId);
  if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) throw new Error("Deal was not found.");
  const now = Date.now();
  const patch = {
    ...args.input,
    ownerUserId: args.input.ownerUserId ?? existing.ownerUserId,
    updatedAt: now,
    ...(args.input.status === "won" || args.input.status === "lost" ? { closedAt: existing.closedAt ?? now } : {}),
  };
  await ctx.db.patch(args.dealId, patch);

  const deal = await ctx.db.get(args.dealId);
  if (!deal) throw new Error("Deal was not found.");
  return { presented: presentDeal(deal), now };
}

async function deleteDealCore(ctx: MutationCtx, args: { organizationId: string; dealId: Id<"deals">; actorUserId: string }) {
  const existing = await ctx.db.get(args.dealId);
  if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) throw new Error("Deal was not found.");
  const now = Date.now();
  await ctx.db.patch(args.dealId, { deletedAt: now, recordState: "deleted", updatedAt: now });
  return { removed: true as const, now, title: existing.title };
}

export const createFromHono = mutation({
  args: { organizationId: v.string(), input: dealInputValidator },
  returns: dealValidator,
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "deal", "create");
    const { presented, now } = await createDealCore(ctx, {
      organizationId: args.organizationId,
      input: args.input,
      actorUserId: user._id,
    });
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "deal.create",
      target: presented.id,
      summary: `Created deal ${args.input.title}.`,
      createdAt: now,
    });
    return presented;
  },
});

export const updateFromHono = mutation({
  args: { organizationId: v.string(), dealId: v.id("deals"), input: dealInputValidator },
  returns: dealValidator,
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "deal", "update");
    const { presented, now } = await updateDealCore(ctx, {
      organizationId: args.organizationId,
      dealId: args.dealId,
      input: args.input,
      actorUserId: user._id,
    });
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "deal.update",
      target: args.dealId,
      summary: `Updated deal ${args.input.title}.`,
      createdAt: now,
    });
    return presented;
  },
});

export const deleteFromHono = mutation({
  args: { organizationId: v.string(), dealId: v.id("deals") },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "deal", "delete");
    const { now, title } = await deleteDealCore(ctx, {
      organizationId: args.organizationId,
      dealId: args.dealId,
      actorUserId: user._id,
    });
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "deal.delete",
      target: args.dealId,
      summary: `Deleted deal ${title}.`,
      createdAt: now,
    });
    return { removed: true };
  },
});

export const createInternal = internalMutation({
  args: { organizationId: v.string(), input: dealInputValidator, actorUserId: v.string() },
  returns: dealValidator,
  handler: async (ctx, args) => {
    const { presented } = await createDealCore(ctx, {
      organizationId: args.organizationId,
      input: args.input,
      actorUserId: args.actorUserId,
    });
    return presented;
  },
});

export const updateInternal = internalMutation({
  args: { organizationId: v.string(), dealId: v.id("deals"), input: dealInputValidator, actorUserId: v.string() },
  returns: dealValidator,
  handler: async (ctx, args) => {
    const { presented } = await updateDealCore(ctx, {
      organizationId: args.organizationId,
      dealId: args.dealId,
      input: args.input,
      actorUserId: args.actorUserId,
    });
    return presented;
  },
});

export const deleteInternal = internalMutation({
  args: { organizationId: v.string(), dealId: v.id("deals"), actorUserId: v.string() },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    await deleteDealCore(ctx, {
      organizationId: args.organizationId,
      dealId: args.dealId,
      actorUserId: args.actorUserId,
    });
    return { removed: true };
  },
});
