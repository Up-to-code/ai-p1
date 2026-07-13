import { defineTool } from "eve/tools";
import { z } from "zod";
import { memoryStore } from "../lib/memory-store";
import { requireWorkspaceActor } from "../lib/workspace-actor";

export default defineTool({
  description: "Remember one stable fact or preference for the current user across sessions.",
  inputSchema: z.object({
    key: z
      .string()
      .min(1)
      .max(80)
      .regex(/^[a-z0-9_.-]+$/),
    value: z.string().min(1).max(4000),
  }),
  async execute(input, ctx) {
    return await memoryStore.put(requireWorkspaceActor(ctx as any), input);
  },
});
