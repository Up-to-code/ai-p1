import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";
import { memoryStore } from "../lib/memory-store";
import { requireTenantCaller } from "../lib/tenant";

export default defineTool({
  description: "Delete one long-term memory belonging to the current user.",
  inputSchema: z.object({ key: z.string().min(1).max(80) }),
  approval: always(),
  async execute({ key }, ctx) {
    const deleted = await memoryStore.delete(requireTenantCaller(ctx as any), key);
    return { deleted };
  },
});
