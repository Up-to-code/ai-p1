import { defineTool } from "eve/tools";
import { z } from "zod";
import { memoryStore } from "../lib/memory-store";
import { requireTenantCaller } from "../lib/tenant";

export default defineTool({
  description: "List long-term memories saved for the current user.",
  inputSchema: z.object({}),
  async execute(_input, ctx) {
    return await memoryStore.list(requireTenantCaller(ctx as any), { limit: 50 });
  },
});
