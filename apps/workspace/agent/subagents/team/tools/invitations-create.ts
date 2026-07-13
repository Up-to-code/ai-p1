import { defineTool } from "eve/tools";
import { z } from "zod";
import { requireWorkspaceActor } from "../../../lib/workspace-actor";
import { requireOrganizationAction, recordOrganizationAction } from "../../../lib/action-workflow";
import { createOrganizationInvitation, listOrganizationRoles } from "../../../lib/better-auth-org";
import { assertAssignableRole } from "../../../lib/access-policy";

export default defineTool({
  description: "Invite a new member to the organization by email.",
  inputSchema: z.object({
    email: z.string().trim().email(),
    role: z.string().trim().min(1).max(80),
  }).passthrough(),
  async execute(args, ctx) {
    const { organizationId } = requireWorkspaceActor(ctx);
    await requireOrganizationAction(ctx, organizationId, "member", "create");
    const roles = await listOrganizationRoles(ctx, organizationId);
    assertAssignableRole(args.role, roles);
    const result = await createOrganizationInvitation(ctx, organizationId, {
      emailAddress: args.email,
      role: args.role,
    });
    await recordOrganizationAction(ctx, organizationId, {
      action: "organization.invitation.create",
      target: args.email,
      summary: `Invited ${args.email} as ${args.role}.`,
    });
    return result;
  },
});
