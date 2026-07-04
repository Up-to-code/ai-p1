import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "../lib/convex";
import { requireOrgId } from "../lib/org-context";

export default defineTool({
  description: "List all spaces in the organization.",
  inputSchema: z.object({}).passthrough(),
  async execute(_args, ctx) {
    const organizationId = requireOrgId(ctx);
    return fetchAuthQuery(ctx, api.spaces.index.listByOrganization, { organizationId });
  },
});
