import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

export function nextRateLimitBucket(
  existing: { count: number; expiresAt: number } | null,
  args: { max: number; windowMs: number; now: number },
) {
  if (!existing || existing.expiresAt <= args.now) {
    return { allowed: true, retryAfterMs: 0, count: 1, expiresAt: args.now + args.windowMs, reset: true };
  }
  if (existing.count >= args.max) {
    return { allowed: false, retryAfterMs: Math.max(1, existing.expiresAt - args.now), count: existing.count, expiresAt: existing.expiresAt, reset: false };
  }
  return { allowed: true, retryAfterMs: 0, count: existing.count + 1, expiresAt: existing.expiresAt, reset: false };
}

export const reserve = internalMutation({
  args: { key: v.string(), max: v.number(), windowMs: v.number(), now: v.number() },
  returns: v.object({ allowed: v.boolean(), retryAfterMs: v.number() }),
  handler: async (ctx, args) => {
    const key = args.key.slice(0, 240);
    const existing = await ctx.db.query("mcpRateLimits").withIndex("by_key", (q) => q.eq("key", key)).first();
    const next = nextRateLimitBucket(existing, args);
    if (next.reset) {
      if (existing) await ctx.db.delete(existing._id);
      await ctx.db.insert("mcpRateLimits", {
        key,
        windowStartedAt: args.now,
        count: next.count,
        expiresAt: next.expiresAt,
      });
      return { allowed: next.allowed, retryAfterMs: next.retryAfterMs };
    }
    if (next.allowed) await ctx.db.patch(existing!._id, { count: next.count });
    return { allowed: next.allowed, retryAfterMs: next.retryAfterMs };
  },
});

export const cleanup = internalMutation({
  args: { now: v.number(), limit: v.optional(v.number()) },
  returns: v.number(),
  handler: async (ctx, args) => {
    const expired = await ctx.db.query("mcpRateLimits").withIndex("by_expiry", (q) => q.lt("expiresAt", args.now)).take(args.limit ?? 500);
    for (const bucket of expired) await ctx.db.delete(bucket._id);
    return expired.length;
  },
});
