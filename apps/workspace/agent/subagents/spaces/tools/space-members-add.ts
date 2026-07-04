import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "../../../lib/convex";
import { requireOrgId } from "../../../lib/org-context";
import { requireOrganizationAction } from "../../../lib/action-workflow";

export default defineTool({
  description: "Add a user to a space with a specific role.",
  inputSchema: z.object({
    spaceId: z.string().min(1),
    userId: z.string().min(1),
    role: z.enum(["admin", "member", "viewer"]),
  }).passthrough(),
  async execute(args, ctx) {
    const organizationId = requireOrgId(ctx);
    await requireOrganizationAction(ctx, organizationId, "space", "update");
    return fetchAuthMutation(ctx, api.spaces.index.add, { organizationId, spaceId: args.spaceId as any, userId: args.userId, role: args.role });
  },
});
