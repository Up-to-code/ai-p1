import { defineTool } from "eve/tools";
import { z } from "zod";
import { requireWorkspaceActor } from "../../../lib/workspace-actor";
import { requireOrganizationAction, recordOrganizationAction } from "../../../lib/action-workflow";
import { listOrganizationRoles, updateOrganizationRole } from "../../../lib/better-auth-org";
import { assertRoleNameIsCustom, normalizeOrganizationRoleName, validatePermissionPayload } from "../../../lib/access-policy";

export default defineTool({
  description: "Update a custom work role's name or permissions.",
  inputSchema: z.object({
    roleId: z.string().min(1),
    roleName: z.string().trim().min(1).max(80).optional(),
    permission: z.record(z.string(), z.array(z.string().trim().min(1)).max(20)).optional(),
  }).passthrough(),
  async execute(args, ctx) {
    const { organizationId } = requireWorkspaceActor(ctx);
    await requireOrganizationAction(ctx, organizationId, "role", "update");
    const currentRole = (await listOrganizationRoles(ctx, organizationId)).find((r) => r.id === args.roleId);
    if (!currentRole) throw new Error("Work role was not found.");
    assertRoleNameIsCustom(currentRole.role);

    const nextRoleName = args.roleName ? normalizeOrganizationRoleName(args.roleName) : undefined;
    if (nextRoleName) assertRoleNameIsCustom(nextRoleName);

    const result = await updateOrganizationRole(ctx, organizationId, args.roleId, {
      name: nextRoleName,
      permissions: args.permission ? validatePermissionPayload(args.permission) : undefined,
    });
    await recordOrganizationAction(ctx, organizationId, {
      action: "organization.role.update",
      target: args.roleId,
      summary: `Updated work role ${nextRoleName ?? currentRole.role}.`,
    });
    return result;
  },
});
