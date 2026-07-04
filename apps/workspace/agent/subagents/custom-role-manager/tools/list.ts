import { defineTool } from "eve/tools";
import { z } from "zod";
import { requireOrgId } from "../../../lib/org-context";
import { requireOrganizationAction } from "../../../lib/action-workflow";
import { listOrganizationRoles } from "../../../lib/clerk-org";

export default defineTool({
  description: "List all custom work roles in the organization.",
  inputSchema: z.object({}).passthrough(),
  async execute(_args, ctx) {
    const organizationId = requireOrgId(ctx);
    await requireOrganizationAction(ctx, organizationId, "role", "read");
    return listOrganizationRoles(organizationId);
  },
});
