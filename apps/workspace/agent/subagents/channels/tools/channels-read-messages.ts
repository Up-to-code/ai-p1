import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "../../../lib/convex";
import { requireOrgId } from "../../../lib/org-context";

export default defineTool({
  description:
    "Read recent messages from a specific inbox channel. Requires the channel ID and respects backend channel permissions.",
  inputSchema: z
    .object({
      channelId: z.string().min(1),
      limit: z.number().int().min(1).max(100).optional(),
    })
    .passthrough(),
  async execute(args, ctx) {
    requireOrgId(ctx);
    const messages = await fetchAuthQuery(ctx, api.inbox.read.listMessages, {
      channelId: args.channelId,
      limit: args.limit ?? 50,
    });

    return {
      channelId: args.channelId,
      count: messages.length,
      messages,
    };
  },
});
