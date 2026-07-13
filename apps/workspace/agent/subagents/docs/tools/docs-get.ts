import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "../../../lib/convex";
import { requireWorkspaceActor } from "../../../lib/workspace-actor";

export default defineTool({
  description:
    "Get a single workspace document by its ID, including its full content.",
  inputSchema: z.object({
    docId: z.string().min(1).describe("The document ID."),
  }),
  async execute(args, ctx) {
    const { organizationId } = requireWorkspaceActor(ctx);
    const doc = await fetchAuthQuery(ctx, api.clientDocs.read.get, {
      organizationId,
      docId: args.docId as never,
    });
    if (!doc) throw new Error("Document was not found.");
    return doc;
  },
});
