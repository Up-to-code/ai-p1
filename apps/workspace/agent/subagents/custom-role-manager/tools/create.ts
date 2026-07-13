import { defineTool } from "eve/tools";
import { z } from "zod";
import { requireWorkspaceActor } from "../../../lib/workspace-actor";
import { requireOrganizationAction, recordOrganizationAction } from "../../../lib/action-workflow";
import { createOrganizationRole } from "../../../lib/better-auth-org";
import { assertRoleNameIsCustom, normalizeOrganizationRoleName, validatePermissionPayload } from "../../../lib/access-policy";

export default defineTool({
  description: "Create a custom work role with specific permissions.",
  inputSchema: z.object({
    role: z.string().trim().min(1).max(80),
    permission: z.record(z.string(), z.array(z.string().trim().min(1)).max(20)),
  }).passthrough(),
  async execute(args, ctx) {
    const { organizationId } = requireWorkspaceActor(ctx);
    await requireOrganizationAction(ctx, organizationId, "role", "create");
    const normalizedRole = normalizeOrganizationRoleName(args.role);
    if (!normalizedRole) throw new Error("Work role name is required.");
    assertRoleNameIsCustom(normalizedRole);
    const result = await createOrganizationRole(ctx, organizationId, {
      name: normalizedRole,
      permissions: validatePermissionPayload(args.permission),
    });
    await recordOrganizationAction(ctx, organizationId, {
      action: "organization.role.create",
      target: normalizedRole,
      summary: `Created work role ${normalizedRole}.`,
    });
    return result;
  },
});
