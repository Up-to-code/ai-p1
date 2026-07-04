import { defineTool } from "eve/tools";
import { z } from "zod";
import { requireOrgId } from "../lib/org-context";
import { requireOrganizationAction, recordOrganizationAction } from "../lib/action-workflow";
import { listOrganizationMembers, listOrganizationRoles, updateOrganizationMemberRole } from "../lib/clerk-org";
import { assertCanChangeMemberRole } from "../lib/access-policy";

export default defineTool({
  description: "Update a member's role in the organization.",
  inputSchema: z.object({
    memberId: z.string().min(1),
    role: z.string().trim().min(1).max(80),
  }).passthrough(),
  async execute(args, ctx) {
    const organizationId = requireOrgId(ctx);
    await requireOrganizationAction(ctx, organizationId, "member", "update");
    const [members, roles] = await Promise.all([
      listOrganizationMembers(organizationId),
      listOrganizationRoles(organizationId),
    ]);
    assertCanChangeMemberRole({ targetMemberId: args.memberId, nextRole: args.role, members, roles });
    const result = await updateOrganizationMemberRole(organizationId, args.memberId, args.role);
    await recordOrganizationAction(ctx, organizationId, {
      action: "organization.member.role.update",
      target: args.memberId,
      summary: `Changed member role to ${args.role}.`,
    });
    return result;
  },
});
