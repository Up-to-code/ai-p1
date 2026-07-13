import { defineTool } from "eve/tools";
import { z } from "zod";
import { memoryStore } from "../lib/memory-store";
import { requireWorkspaceActor } from "../lib/workspace-actor";

export default defineTool({
  description: "List long-term memories saved for the current user.",
  inputSchema: z.object({}),
  async execute(_input, ctx) {
    return await memoryStore.list(requireWorkspaceActor(ctx as any), { limit: 50 });
  },
});
