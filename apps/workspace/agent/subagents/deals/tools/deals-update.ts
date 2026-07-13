import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery, fetchAuthMutation } from "../../../lib/convex";
import { requireWorkspaceActor } from "../../../lib/workspace-actor";
import { buildDealUpdateInput, dealUpdatePatchSchema } from "../deal-update-input";

export default defineTool({
  description: "Update an existing deal.",
  inputSchema: dealUpdatePatchSchema
    .extend({ dealId: z.string().min(1) })
    .strict(),
  async execute(args, ctx) {
    const { organizationId } = requireWorkspaceActor(ctx);
    const existing = await fetchAuthQuery(ctx, api.deals.read.get, {
      organizationId,
      dealId: args.dealId as never,
    });
    if (!existing) throw new Error("Deal was not found.");
    const { dealId, ...patch } = args;
    return fetchAuthMutation(ctx, api.deals.write.updateFromHono, {
      organizationId,
      dealId: dealId as never,
      input: buildDealUpdateInput(existing, patch) as never,
    });
  },
});
