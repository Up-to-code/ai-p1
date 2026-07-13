import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "../../../lib/convex";
import { requireWorkspaceActor } from "../../../lib/workspace-actor";
import { requireOrganizationAction } from "../../../lib/action-workflow";

export default defineTool({
  description: "Delete a space. Only organization owners can delete spaces.",
  inputSchema: z.object({
    spaceId: z.string().min(1),
  }).passthrough(),
  async execute(args, ctx) {
    const { organizationId } = requireWorkspaceActor(ctx);
    await requireOrganizationAction(ctx, organizationId, "space", "delete");
    return fetchAuthMutation(ctx, api.spaces.index.removeSpace, { organizationId, spaceId: args.spaceId as any });
  },
});
