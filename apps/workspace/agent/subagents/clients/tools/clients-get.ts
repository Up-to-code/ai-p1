import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "../../../lib/convex";
import { requireOrgId } from "../../../lib/org-context";

export default defineTool({
  description: "Get a single client by ID.",
  inputSchema: z.object({
    clientId: z.string().min(1),
  }).passthrough(),
  async execute(args, ctx) {
    const organizationId = requireOrgId(ctx);
    return fetchAuthQuery(ctx, api.clients.read.get, {
      organizationId,
      clientId: args.clientId as never,
    });
  },
});
