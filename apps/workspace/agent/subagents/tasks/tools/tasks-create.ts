import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "../../../lib/convex";
import { requireWorkspaceActor } from "../../../lib/workspace-actor";
import {
  taskPrioritySchema,
  taskStatusSchema,
  visibilitySchema,
} from "@qentrah/domain-contracts";

export default defineTool({
  description: "Create a new task.",
  inputSchema: z.object({
    title: z.string().min(1),
    status: taskStatusSchema,
    visibility: visibilitySchema.optional(),
    priority: taskPrioritySchema,
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
