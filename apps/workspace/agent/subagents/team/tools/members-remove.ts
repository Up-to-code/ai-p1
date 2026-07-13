import { defineTool } from "eve/tools";
import { z } from "zod";
import { requireWorkspaceActor } from "../../../lib/workspace-actor";
import { requireOrganizationAction, recordOrganizationAction } from "../../../lib/action-workflow";
import { listOrganizationMembers, removeOrganizationMember } from "../../../lib/better-auth-org";
import { assertCanRemoveMember } from "../../../lib/access-policy";

export default defineTool({
  description: "Remove a member from the organization.",
  inputSchema: z.object({
    memberIdOrEmail: z.string().min(1),
  }).passthrough(),
  async execute(args, ctx) {
    const { organizationId, userId } = requireWorkspaceActor(ctx);
    await requireOrganizationAction(ctx, organizationId, "member", "delete");
    const members = await listOrganizationMembers(ctx, organizationId);
    assertCanRemoveMember({
      currentUserId: userId,
      targetMemberIdOrEmail: args.memberIdOrEmail,
      members,
    });
    const result = await removeOrganizationMember(ctx, organizationId, args.memberIdOrEmail);
    await recordOrganizationAction(ctx, organizationId, {
      action: "organization.member.remove",
      target: args.memberIdOrEmail,
      summary: "Removed organization member.",
    });
    return result;
  },
});
