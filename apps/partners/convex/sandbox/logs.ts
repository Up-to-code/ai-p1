import { v } from "convex/values";
import { mutationGeneric } from "convex/server";

export const recordRequestLog = mutationGeneric({
  args: {
    partnerAuthSubject: v.optional(v.string()),
    partnerAppId: v.optional(v.string()),
    organizationId: v.optional(v.string()),
    method: v.string(),
    path: v.string(),
    status: v.number(),
    latencyMs: v.number(),
    scopes: v.array(v.string()),
    input: v.optional(v.any()),
    response: v.optional(v.any()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const appId = args.partnerAppId ? ctx.db.normalizeId("partnerApps", args.partnerAppId) : null;
    await ctx.db.insert("sandboxRequestLogs", {
      partnerAuthSubject: args.partnerAuthSubject,
      partnerAppId: appId ?? undefined,
      organizationId: args.organizationId,
      method: args.method,
      path: args.path,
      status: args.status,
      latencyMs: args.latencyMs,
      scopes: args.scopes,
      input: args.input,
      response: args.response,
      error: args.error,
      createdAt: Date.now(),
    });
    return { ok: true };
  },
});
