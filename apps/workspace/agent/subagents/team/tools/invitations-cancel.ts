import { defineTool } from "eve/tools";
import { z } from "zod";
import { requireWorkspaceActor } from "../../../lib/workspace-actor";
import { requireOrganizationAction, recordOrganizationAction } from "../../../lib/action-workflow";
import { revokeOrganizationInvitation } from "../../../lib/better-auth-org";

export default defineTool({
  description: "Cancel a pending invitation.",
  inputSchema: z.object({
    invitationId: z.string().min(1),
  }).passthrough(),
  async execute(args, ctx) {
    const { organizationId } = requireWorkspaceActor(ctx);
    await requireOrganizationAction(ctx, organizationId, "member", "create");
    const result = await revokeOrganizationInvitation(ctx, organizationId, args.invitationId);
    await recordOrganizationAction(ctx, organizationId, {
      action: "organization.invitation.cancel",
      target: args.invitationId,
      summary: "Canceled email invitation.",
    });
    return result;
  },
});
