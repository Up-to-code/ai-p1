import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "../../../lib/convex";
import { requireOrgId } from "../../../lib/org-context";
import { requireOrganizationAction, recordOrganizationAction } from "../../../lib/action-workflow";
import { listOrganizationMembers, listOrganizationInvitations, listOrganizationRoles, deleteOrganizationRole } from "../../../lib/clerk-org";
import { assertCanDeleteRole } from "../../../lib/access-policy";

export default defineTool({
  description: "Delete a custom work role.",
  inputSchema: z.object({
    roleId: z.string().min(1),
  }).passthrough(),
  async execute(args, ctx) {
    const organizationId = requireOrgId(ctx);
    await requireOrganizationAction(ctx, organizationId, "role", "delete");
    const [members, invitations, roles] = await Promise.all([
      listOrganizationMembers(organizationId),
      listOrganizationInvitations(organizationId),
      listOrganizationRoles(organizationId),
    ]);
    const role = roles.find((item) => item.id === args.roleId);
    if (!role) throw new Error("Work role was not found.");

    const pendingInviteLinkCount = await fetchAuthQuery(
      ctx,
      api.organizations.inviteLinks.read.countPendingByRole,
      { organizationId, role: role.role },
    );

    assertCanDeleteRole({ role, members, invitations, pendingInviteLinkCount });

    const result = await deleteOrganizationRole(organizationId, args.roleId);
    await recordOrganizationAction(ctx, organizationId, {
      action: "organization.role.delete",
      target: args.roleId,
      summary: `Deleted work role ${role.role}.`,
    });
    return result;
  },
});
