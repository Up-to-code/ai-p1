import { defineTool } from "eve/tools";
import { z } from "zod";
import { requireOrgId } from "../lib/org-context";
import { requireOrganizationAction, recordOrganizationAction } from "../lib/action-workflow";
import { revokeOrganizationInvitation } from "../lib/clerk-org";

export default defineTool({
  description: "Cancel a pending invitation.",
  inputSchema: z.object({
    invitationId: z.string().min(1),
  }).passthrough(),
  async execute(args, ctx) {
    const organizationId = requireOrgId(ctx);
    await requireOrganizationAction(ctx, organizationId, "member", "create");
    const result = await revokeOrganizationInvitation(organizationId, args.invitationId);
    await recordOrganizationAction(ctx, organizationId, {
      action: "organization.invitation.cancel",
      target: args.invitationId,
      summary: "Canceled email invitation.",
    });
    return result;
  },
});
