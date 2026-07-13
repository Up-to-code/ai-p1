import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "../../../lib/convex";
import { requireWorkspaceActor } from "../../../lib/workspace-actor";

export default defineTool({
  description: "Get a single task by ID.",
  inputSchema: z.object({
    taskId: z.string().min(1),
  }).passthrough(),
  async execute(args, ctx) {
    const { organizationId } = requireWorkspaceActor(ctx);
    return fetchAuthQuery(ctx, api.clientTasks.read.get, {
      organizationId,
      taskId: args.taskId as never,
    });
  },
});
