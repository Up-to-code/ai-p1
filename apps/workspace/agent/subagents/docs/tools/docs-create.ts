import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "../../../lib/convex";
import { requireWorkspaceActor } from "../../../lib/workspace-actor";
import { runOrganizationActionWorkflow } from "../../../lib/action-workflow";

export default defineTool({
  description:
    "Create a new workspace document with a title and optional content. Documents can be linked to a project and assigned a visibility level.",
  inputSchema: z.object({
    title: z.string().min(1).max(300).describe("The document title."),
    content: z.string().optional().describe("The document body content (markdown supported)."),
    projectId: z.string().optional().describe("Link this document to a project."),
    folderId: z.string().optional().describe("Place this document in a specific folder."),
    visibility: z
      .enum(["private", "team", "workspace"])
      .optional()
      .default("private")
      .describe("Who can see this document. Defaults to private."),
    tags: z.array(z.string()).optional().describe("Optional tags for the document."),
  }),
  async execute(args, ctx) {
    const { organizationId } = requireWorkspaceActor(ctx);
    return runOrganizationActionWorkflow(ctx, organizationId, {
      permission: { resource: "document", action: "create" },
      perform: () =>
        fetchAuthMutation(ctx, api.clientDocs.write.createFromHono, {
          organizationId,
          input: {
            title: args.title,
            content: args.content,
            projectId: args.projectId,
            folderId: args.folderId,
            visibility: args.visibility ?? "private",
            tags: args.tags,
          },
        }),
      audit: {
        action: "doc.create",
        target: args.title,
        summary: `Created document "${args.title}".`,
      },
    });
  },
});
