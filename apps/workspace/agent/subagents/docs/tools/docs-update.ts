import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery, fetchAuthMutation } from "../../../lib/convex";
import { requireOrgId } from "../../../lib/org-context";
import { runOrganizationActionWorkflow } from "../../../lib/action-workflow";

export default defineTool({
  description:
    "Update an existing workspace document. Only the fields you provide will be changed.",
  inputSchema: z.object({
    docId: z.string().min(1).describe("The ID of the document to update."),
    title: z.string().min(1).max(300).optional().describe("New title for the document."),
    content: z.string().optional().describe("New body content for the document."),
    projectId: z.string().optional().describe("Re-link the document to a different project."),
    folderId: z.string().optional().describe("Move the document to a different folder."),
    visibility: z
      .enum(["private", "team", "workspace"])
      .optional()
      .describe("New visibility setting."),
    tags: z.array(z.string()).optional().describe("Replace the document's tags."),
  }),
  async execute(args, ctx) {
    const organizationId = requireOrgId(ctx);
    return runOrganizationActionWorkflow(ctx, organizationId, {
      permission: { resource: "client", action: "update" },
      perform: async () => {
        // Fetch existing to merge fields — only update what was provided
        const existing = await fetchAuthQuery(ctx, api.clientDocs.read.get, {
          organizationId,
          docId: args.docId as never,
        });
        if (!existing) throw new Error("Document was not found.");

        return fetchAuthMutation(ctx, api.clientDocs.write.updateFromHono, {
          organizationId,
          docId: args.docId as never,
          input: {
            title: args.title ?? existing.title,
            content: args.content ?? existing.content,
            projectId: args.projectId ?? existing.projectId,
            folderId: args.folderId ?? existing.folderId,
            visibility: args.visibility ?? existing.visibility,
            tags: args.tags ?? existing.tags,
          },
        });
      },
      audit: {
        action: "doc.update",
        target: args.docId,
        summary: (result) => `Updated document "${(result as { title: string }).title}".`,
      },
    });
  },
});
