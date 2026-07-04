import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "../../../lib/convex";
import { requireOrgId } from "../../../lib/org-context";
import { compact } from "../../../lib/helpers";

export default defineTool({
  description:
    "List workspace documents. Optionally filter by project. Returns title, visibility, folder, and last updated time.",
  inputSchema: z.object({
    projectId: z.string().optional().describe("Filter docs to a specific project."),
    limit: z.number().int().min(1).max(50).optional(),
  }),
  async execute(args, ctx) {
    const organizationId = requireOrgId(ctx);
    const docs = await fetchAuthQuery(ctx, api.clientDocs.read.list, {
      organizationId,
      projectId: args.projectId,
    });
    return compact(docs, args.limit ?? 25);
  },
});
