import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "../../../lib/convex";
import { requireOrgId } from "../../../lib/org-context";

export default defineTool({
  description: "List all members of a space.",
  inputSchema: z.object({
    spaceId: z.string().min(1),
  }).passthrough(),
  async execute(args, ctx) {
    const organizationId = requireOrgId(ctx);
    return fetchAuthQuery(ctx, api.spaces.index.list, { organizationId, spaceId: args.spaceId as any });
  },
});
