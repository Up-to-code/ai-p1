import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "../../../lib/convex";
import { requireOrgId } from "../../../lib/org-context";

export default defineTool({
  description: "Read organization profile and display information.",
  inputSchema: z.object({}).passthrough(),
  async execute(_args, ctx) {
    const organizationId = requireOrgId(ctx);
    return fetchAuthQuery(ctx, api.organizations.profile.read.getProfile, { organizationId });
  },
});
