import type { QueryCtx } from "../../_generated/server";
import type { ReadHandler, ReadToolArgs } from "./shared";

export const organizationInfo: ReadHandler = async (ctx: QueryCtx, args: ReadToolArgs) => {
  const organization = await ctx.db
    .query("organizations")
    .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
    .first();
  return {
    organization,
    agentLink: {
      id: args.connectionId,
      name: args.connectionName,
      instructions: args.instructions,
      permissions: args.permissions,
    },
  };
};
