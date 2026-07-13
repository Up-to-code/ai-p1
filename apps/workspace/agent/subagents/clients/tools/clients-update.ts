import { defineTool } from "eve/tools";
import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "../../../lib/convex";
import { requireWorkspaceActor } from "../../../lib/workspace-actor";
import {
  clientUpdateToolInputSchema,
  parseClientUpdatePatch,
} from "../client-update-input";

export default defineTool({
  description: "Update an existing client's details.",
  inputSchema: clientUpdateToolInputSchema,
  async execute(args, ctx) {
    const { organizationId } = requireWorkspaceActor(ctx);
    const { clientId, ...patch } = args;
    return fetchAuthMutation(ctx, api.clients.write.updateFromHono, {
      organizationId,
      clientId: clientId as never,
      input: parseClientUpdatePatch(patch),
    });
  },
});
