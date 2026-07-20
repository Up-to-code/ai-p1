import { ConvexError } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { getAuthUser } from "../auth";
import { resolveScopePolicy } from "../mcp/scopePolicy";

type CustomAgentCtx = QueryCtx | MutationCtx;

export function customAgentError(code: string, message: string): never {
  throw new ConvexError({ code, message });
}

export async function requireCustomAgentOwner(
  ctx: CustomAgentCtx,
  agentId: Id<"customAgents">,
): Promise<{ agent: Doc<"customAgents">; userId: string }> {
  const user = await getAuthUser(ctx);
  const agent = await ctx.db.get(agentId);
  if (!agent || agent.ownerUserId !== user._id) {
    customAgentError("CUSTOM_AGENT_NOT_FOUND", "Custom agent not found.");
  }
  await resolveScopePolicy(ctx, {
    organizationId: agent.organizationId,
    actorUserId: user._id,
    scope: { type: "organization" },
  });
  return { agent, userId: user._id };
}
