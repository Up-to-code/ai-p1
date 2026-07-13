import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";
import { memoryStore } from "../lib/memory-store";
import { requireWorkspaceActor } from "../lib/workspace-actor";

export default defineTool({
  description: "Delete one long-term memory belonging to the current user.",
  inputSchema: z.object({ key: z.string().min(1).max(80) }),
  approval: always(),
  async execute({ key }, ctx) {
    const deleted = await memoryStore.delete(requireWorkspaceActor(ctx as any), key);
    return { deleted };
  },
});
