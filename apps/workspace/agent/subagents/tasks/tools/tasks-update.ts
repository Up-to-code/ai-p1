import { defineTool } from "eve/tools";
import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "../../../lib/convex";
import { requireWorkspaceActor } from "../../../lib/workspace-actor";
import { parseTaskUpdatePatch, taskUpdateToolInputSchema } from "../task-update-input";

export default defineTool({
  description: "Update an existing task.",
  inputSchema: taskUpdateToolInputSchema,
  async execute(args, ctx) {
    const { organizationId } = requireWorkspaceActor(ctx);
    const { taskId, ...patch } = args;
    return fetchAuthMutation(ctx, api.clientTasks.write.updateFromHono, {
      organizationId,
      taskId: taskId as never,
      input: parseTaskUpdatePatch(patch),
    });
  },
});
