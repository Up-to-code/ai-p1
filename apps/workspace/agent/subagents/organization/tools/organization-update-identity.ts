import { defineTool } from "eve/tools";
import { z } from "zod";
import { requireOrgId } from "../../../lib/org-context";
import { requireOrganizationAction, recordOrganizationAction } from "../../../lib/action-workflow";
import { updateOrganizationIdentity } from "../../../lib/better-auth-org";

export default defineTool({
  description: "Update organization identity (name, slug, logo).",
  inputSchema: z.object({
    name: z.string().trim().min(1).max(120).optional(),
    slug: z.string().trim().min(1).max(120).optional(),
    logo: z.string().trim().max(500).optional(),
  }).passthrough(),
  async execute(args, ctx) {
    const organizationId = requireOrgId(ctx);
    await requireOrganizationAction(ctx, organizationId, "organization", "update");
    const result = await updateOrganizationIdentity(ctx, organizationId, args);
    await recordOrganizationAction(ctx, organizationId, {
      action: "organization.identity.update",
      target: organizationId,
      summary: args.logo
        ? "Updated organization logo."
        : `Updated organization identity${args.name ? ` to ${args.name}` : ""}.`,
    });
    return result;
  },
});
