import { mutationGeneric } from "convex/server";
import { v } from "convex/values";

export const recordIntegrationEvent = mutationGeneric({
  args: {
    direction: v.union(v.literal("outbound"), v.literal("inbound")),
    contract: v.string(),
    idempotencyKey: v.string(),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("ananIntegrationEvents")
      .withIndex("by_idempotencyKey", (q: any) => q.eq("idempotencyKey", args.idempotencyKey))
      .first();
    if (existing) {
      return { eventId: existing._id, deduped: true };
    }
    const eventId = await ctx.db.insert("ananIntegrationEvents", {
      direction: args.direction,
      contract: args.contract,
      idempotencyKey: args.idempotencyKey,
      status: "pending",
      attempts: 0,
      payload: args.payload,
      createdAt: now,
      updatedAt: now,
    });
    return { eventId, deduped: false };
  },
});
