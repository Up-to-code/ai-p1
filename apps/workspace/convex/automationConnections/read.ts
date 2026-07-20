import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthUser } from "../auth";
import { resolveScopePolicy } from "../mcp/scopePolicy";
import { automationConnectionProviderValidator } from "../schema/automationConnections";
import { automationConnectionSummaryValidator } from "./validators";

export const listMine = query({
  args: {
    organizationId: v.string(),
    provider: v.optional(automationConnectionProviderValidator),
  },
  returns: v.array(automationConnectionSummaryValidator),
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    await resolveScopePolicy(ctx, {
      organizationId: args.organizationId,
      actorUserId: user._id,
      scope: { type: "organization" },
    });
    const rows = args.provider
      ? await ctx.db
          .query("automationConnections")
          .withIndex("by_owner_organization_provider", (q) =>
            q
              .eq("ownerUserId", user._id)
              .eq("organizationId", args.organizationId)
              .eq("provider", args.provider!),
          )
          .take(100)
      : await ctx.db
          .query("automationConnections")
          .withIndex("by_organization_status", (q) =>
            q.eq("organizationId", args.organizationId).eq("status", "active"),
          )
          .take(200);
    return rows
      .filter((row) => row.ownerUserId === user._id)
      .map((row) => ({
        id: row._id,
        organizationId: row.organizationId,
        provider: row.provider,
        label: row.label,
        accountLabel: row.accountLabel,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        lastUsedAt: row.lastUsedAt,
      }));
  },
});
