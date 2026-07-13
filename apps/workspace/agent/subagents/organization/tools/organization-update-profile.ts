import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "../../../lib/convex";
import { requireWorkspaceActor } from "../../../lib/workspace-actor";
import { requireOrganizationAction } from "../../../lib/action-workflow";

export default defineTool({
  description: "Update organization profile (name, legal name, type, email, phone, website, address).",
  inputSchema: z.object({
    name: z.string().trim().min(1).max(120),
    legalName: z.string().trim().max(180),
    type: z.string().trim().max(80),
    email: z.string().trim().email().or(z.literal("")),
    phone: z.string().trim().max(40),
    website: z.string().trim().max(120),
    address: z.string().trim().max(240),
  }).passthrough(),
  async execute(args, ctx) {
    const { organizationId } = requireWorkspaceActor(ctx);
    await requireOrganizationAction(ctx, organizationId, "organization", "update");
    return fetchAuthMutation(ctx, api.organizations.profile.write.updateProfileFromHono, {
      organizationId,
      input: args,
    });
  },
});
