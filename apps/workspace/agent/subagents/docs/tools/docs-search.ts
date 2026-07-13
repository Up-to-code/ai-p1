import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "../../../lib/convex";
import { requireWorkspaceActor } from "../../../lib/workspace-actor";

export default defineTool({
  description:
    "Search workspace documents by title, content, or tags. Returns matching docs with a content preview.",
  inputSchema: z.object({
    query: z.string().min(1).max(200).describe("Text to search for in document titles, content, and tags."),
    projectId: z.string().optional().describe("Limit search to a specific project."),
  }),
  async execute(args, ctx) {
    const { organizationId } = requireWorkspaceActor(ctx);
    const docs = await fetchAuthQuery(ctx, api.clientDocs.read.search, {
      organizationId,
      query: args.query,
      projectId: args.projectId,
    });
    // Return docs with a content preview to keep context compact
    return (Array.isArray(docs) ? docs : []).map((doc) => ({
      ...doc,
      content: typeof doc.content === "string"
        ? doc.content.slice(0, 300).replace(/\s+/g, " ").trim()
        : undefined,
    }));
  },
});
