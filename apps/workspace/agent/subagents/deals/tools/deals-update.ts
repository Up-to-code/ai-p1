import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery, fetchAuthMutation } from "../../../lib/convex";
import { requireOrgId } from "../../../lib/org-context";
import { updateEntity } from "../../../lib/update-entity";

export default defineTool({
  description: "Update an existing deal.",
  inputSchema: z.object({
    dealId: z.string().min(1),
    title: z.string().min(1).optional(),
    clientId: z.string().min(1).optional(),
    projectId: z.string().min(1).optional(),
    stage: z.enum(["lead", "qualified", "proposal_sent", "contract_sent", "won", "lost"]).optional(),
    status: z.enum(["open", "won", "lost", "paused"]).optional(),
    value: z.number().optional(),
    currency: z.string().optional(),
    dealThinking: z.string().optional(),
    source: z.string().optional(),
    priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
    closeDate: z.string().optional(),
    nextStep: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }).passthrough(),
  async execute(args, ctx) {
    const organizationId = requireOrgId(ctx);
    return updateEntity({
      organizationId,
      id: args.dealId,
      idKey: "dealId",
      label: "Deal",
      fetchExisting: () => fetchAuthQuery(ctx, api.deals.read.get, { organizationId, dealId: args.dealId as never }),
      updateFn: (orgId, id, data) =>
        fetchAuthMutation(ctx, api.deals.write.updateFromHono, {
          organizationId: orgId,
          dealId: id as never,
          input: data as never,
        }),
      input: args,
      schema: z.object({}).passthrough(),
    });
  },
});
