import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "../lib/convex";
import { requireOrgId } from "../lib/org-context";

export default defineTool({
  description: "Get details of a specific space by ID or slug.",
  inputSchema: z.object({
    spaceId: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
  }).refine((data) => data.spaceId || data.slug, { message: "Provide either spaceId or slug." }).passthrough(),
  async execute(args, ctx) {
    const organizationId = requireOrgId(ctx);
    if (args.spaceId) {
      return fetchAuthQuery(ctx, api.spaces.index.get, { organizationId, spaceId: args.spaceId as any });
    }
    return fetchAuthQuery(ctx, api.spaces.index.getBySlug, { organizationId, slug: args.slug! });
  },
});
