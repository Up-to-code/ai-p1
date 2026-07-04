import { defineTool } from "eve/tools";
import { z } from "zod";
import { requireOrgId } from "../../../lib/org-context";
import { requireOrganizationAction, recordOrganizationAction } from "../../../lib/action-workflow";
import { listOrganizationMembers, removeOrganizationMember } from "../../../lib/clerk-org";
import { assertCanRemoveMember } from "../../../lib/access-policy";

export default defineTool({
  description: "Remove a member from the organization.",
  inputSchema: z.object({
    memberIdOrEmail: z.string().min(1),
  }).passthrough(),
  async execute(args, ctx) {
    const organizationId = requireOrgId(ctx);
    await requireOrganizationAction(ctx, organizationId, "member", "delete");
    const members = await listOrganizationMembers(organizationId);
    const userId = ctx.session.auth.current?.attributes?.userId;
    assertCanRemoveMember({
      currentUserId: (typeof userId === "string" ? userId : ""),
      targetMemberIdOrEmail: args.memberIdOrEmail,
      members,
    });
    const result = await removeOrganizationMember(organizationId, args.memberIdOrEmail);
    await recordOrganizationAction(ctx, organizationId, {
      action: "organization.member.remove",
      target: args.memberIdOrEmail,
      summary: "Removed organization member.",
    });
    return result;
  },
});
