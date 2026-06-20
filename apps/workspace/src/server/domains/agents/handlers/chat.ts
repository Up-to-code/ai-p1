import type { Context } from "hono";
import { getMobileRequestContext } from "@/server/middleware/mobile-request-context";
import { requireOrganizationId } from "@/server/utils/organization/require-organization-id";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { agentChatSchema } from "../validation/chat.schema";
import { createAgentChatStream } from "../services/orchestrator";

export async function handleAgentChat(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;

  const parsed = await validateJsonBody(c, agentChatSchema, "Invalid agent chat payload.");
  if (!parsed.ok) return parsed.response;

  return new Response(
    createAgentChatStream({
      honoContext: c,
      organizationId: org.organizationId,
      threadId: parsed.data.threadId,
      message: parsed.data.message,
      attachments: parsed.data.attachments,
      requestContext: getMobileRequestContext(c),
      abortSignal: c.req.raw.signal,
    }),
    {
      headers: {
        "content-type": "text/event-stream; charset=utf-8",
        "cache-control": "no-cache, no-transform",
        "x-accel-buffering": "no",
      },
    },
  );
}
