import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "../../../lib/convex";
import { requireOrgId } from "../../../lib/org-context";

function stripHtml(content: string) {
  return content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default defineTool({
  description:
    "Search messages inside a specific inbox channel. Requires the channel ID and respects backend channel permissions.",
  inputSchema: z
    .object({
      channelId: z.string().min(1),
      query: z.string().trim().min(1).max(200),
      limit: z.number().int().min(1).max(100).optional(),
    })
    .passthrough(),
  async execute(args, ctx) {
    requireOrgId(ctx);
    const query = args.query.trim().toLowerCase();
    const messages = await fetchAuthQuery(ctx, api.inbox.read.listMessages, {
      channelId: args.channelId,
      limit: 100,
    });
    const matches = messages
      .filter((message) =>
        stripHtml(message.content).toLowerCase().includes(query),
      )
      .slice(0, args.limit ?? 25);

    return {
      channelId: args.channelId,
      query: args.query,
      count: matches.length,
      messages: matches,
    };
  },
});
