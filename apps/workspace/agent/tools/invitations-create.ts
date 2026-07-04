import { defineTool } from "eve/tools";
import { z } from "zod";
import { requireOrgId } from "../lib/org-context";
import { requireOrganizationAction, recordOrganizationAction } from "../lib/action-workflow";
import { createOrganizationInvitation, listOrganizationRoles } from "../lib/clerk-org";
import { assertAssignableRole } from "../lib/access-policy";

export default defineTool({
  description: "Invite a new member to the organization by email.",
  inputSchema: z.object({
    email: z.string().trim().email(),
    role: z.string().trim().min(1).max(80),
  }).passthrough(),
  async execute(args, ctx) {
    const organizationId = requireOrgId(ctx);
    await requireOrganizationAction(ctx, organizationId, "member", "create");
    const roles = await listOrganizationRoles(organizationId);
    assertAssignableRole(args.role, roles);
    const result = await createOrganizationInvitation(organizationId, {
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
