import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "../../../lib/convex";
import { requireOrgId } from "../../../lib/org-context";

export default defineTool({
  description: "Create a new deal in the pipeline.",
  inputSchema: z.object({
    title: z.string().min(1),
    clientId: z.string().min(1).optional(),
    projectId: z.string().min(1).optional(),
    stage: z.enum(["lead", "qualified", "proposal_sent", "contract_sent", "won", "lost"]),
    status: z.enum(["open", "won", "lost", "paused"]),
    value: z.number().optional(),
    currency: z.string().optional(),
    dealThinking: z.string().optional(),
    source: z.string().optional(),
    priority: z.enum(["low", "normal", "high", "urgent"]),
    closeDate: z.string().optional(),
    nextStep: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }).passthrough(),
  async execute(args, ctx) {
    const organizationId = requireOrgId(ctx);
    return fetchAuthMutation(ctx, api.deals.write.createFromHono, {
      organizationId,
      input: args as never,
    });
  },
});
