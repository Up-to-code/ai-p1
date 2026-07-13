import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "../../../lib/convex";
import { requireWorkspaceActor } from "../../../lib/workspace-actor";

export default defineTool({
  description: "Create a new task.",
  inputSchema: z.object({
    title: z.string().min(1),
    status: z.enum(["todo", "inProgress", "waiting", "done", "canceled"]),
    visibility: z.enum(["private", "team", "workspace"]).optional(),
    priority: z.enum(["low", "normal", "high", "urgent"]),
    assigneeUserId: z.string().optional(),
    clientId: z.string().min(1).optional(),
    projectId: z.string().min(1).optional(),
    dueDate: z.string().optional(),
    description: z.string().optional(),
  }).passthrough(),
  async execute(args, ctx) {
    const { organizationId } = requireWorkspaceActor(ctx);
    return fetchAuthMutation(ctx, api.clientTasks.write.createFromHono, {
      organizationId,
      input: args as never,
    });
  },
});
