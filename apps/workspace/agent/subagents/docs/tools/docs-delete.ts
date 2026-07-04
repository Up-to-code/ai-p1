import { defineTool } from "eve/tools";
import { z } from "zod";
import { always } from "eve/tools/approval";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery, fetchAuthMutation } from "../../../lib/convex";
import { requireOrgId } from "../../../lib/org-context";
import { runOrganizationActionWorkflow } from "../../../lib/action-workflow";

export default defineTool({
  description:
    "Delete a workspace document. This action requires user confirmation and cannot be undone.",
  inputSchema: z.object({
    docId: z.string().min(1).describe("The ID of the document to delete."),
  }),
  approval: always(),
  async execute(args, ctx) {
    const organizationId = requireOrgId(ctx);
    // Fetch title first so we can show it in the audit log and confirmation
    const existing = await fetchAuthQuery(ctx, api.clientDocs.read.get, {
      organizationId,
      docId: args.docId as never,
    });
    if (!existing) throw new Error("Document was not found.");

    return runOrganizationActionWorkflow(ctx, organizationId, {
      permission: { resource: "client", action: "update" },
      perform: () =>
        fetchAuthMutation(ctx, api.clientDocs.write.deleteFromHono, {
          organizationId,
          docId: args.docId as never,
        }),
      audit: {
        action: "doc.delete",
        target: args.docId,
        summary: `Deleted document "${existing.title}".`,
      },
    });
  },
});
