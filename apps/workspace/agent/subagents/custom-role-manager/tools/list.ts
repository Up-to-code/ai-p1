import { defineTool } from "eve/tools";
import { z } from "zod";
import { requireWorkspaceActor } from "../../../lib/workspace-actor";
import { requireOrganizationAction } from "../../../lib/action-workflow";
import { listOrganizationRoles } from "../../../lib/better-auth-org";

export default defineTool({
  description: "List all custom work roles in the organization.",
  inputSchema: z.object({}).passthrough(),
  async execute(_args, ctx) {
    const { organizationId } = requireWorkspaceActor(ctx);
    await requireOrganizationAction(ctx, organizationId, "role", "read");
    return listOrganizationRoles(ctx, organizationId);
  },
});
