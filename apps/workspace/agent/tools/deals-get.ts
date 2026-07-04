import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "../lib/convex";
import { requireOrgId } from "../lib/org-context";

export default defineTool({
  description: "Get a single deal by ID.",
  inputSchema: z.object({
    dealId: z.string().min(1),
  }).passthrough(),
  async execute(args, ctx) {
    const organizationId = requireOrgId(ctx);
    return fetchAuthQuery(ctx, api.deals.read.get, {
      organizationId,
      dealId: args.dealId as never,
    });
  },
});
