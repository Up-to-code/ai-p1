import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "../../../lib/convex";
import { requireWorkspaceActor } from "../../../lib/workspace-actor";
import { requireOrganizationAction } from "../../../lib/action-workflow";

export default defineTool({
  description: "Remove a user from a space.",
  inputSchema: z.object({
    spaceId: z.string().min(1),
    userId: z.string().min(1),
  }).passthrough(),
  async execute(args, ctx) {
    const { organizationId } = requireWorkspaceActor(ctx);
    await requireOrganizationAction(ctx, organizationId, "space", "update");
    return fetchAuthMutation(ctx, api.spaces.index.removeSpaceMember, { organizationId, spaceId: args.spaceId as any, userId: args.userId });
  },
});
