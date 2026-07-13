import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "../../../lib/convex";
import { requireWorkspaceActor } from "../../../lib/workspace-actor";

export default defineTool({
  description: "List deals, optionally filtered by stage.",
  inputSchema: z.object({
    stage: z.enum(["lead", "qualified", "proposal_sent", "contract_sent", "won", "lost"]).optional(),
    search: z.string().trim().max(160).optional(),
    limit: z.number().int().min(1).max(50).optional(),
  }).passthrough(),
  async execute(args, ctx) {
    const { organizationId } = requireWorkspaceActor(ctx);
    return fetchAuthQuery(ctx, api.deals.read.list, {
      organizationId,
      stage: args.stage,
      search: args.search,
      limit: Math.max(1, Math.min(args.limit ?? 25, 50)),
    });
  },
});
