import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "../lib/convex";
import { requireOrgId } from "../lib/org-context";

export default defineTool({
  description: "List projects with optional search and pagination.",
  inputSchema: z.object({
    limit: z.number().int().min(1).max(50).optional(),
    search: z.string().trim().max(160).optional(),
    cursor: z.string().nullable().optional(),
  }).passthrough(),
  async execute(args, ctx) {
    const organizationId = requireOrgId(ctx);
    return fetchAuthQuery(ctx, api.projects.read.listPaged, {
      organizationId,
      paginationOpts: { numItems: Math.max(1, Math.min(args.limit ?? 25, 50)), cursor: args.cursor ?? null },
      search: args.search,
    });
  },
});
