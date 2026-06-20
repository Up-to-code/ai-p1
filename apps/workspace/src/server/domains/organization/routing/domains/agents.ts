import { Hono } from "hono";
import { handleAgentChat } from "@/server/domains/agents/handlers/chat";
import {
  handleApproveAgentConfirmation,
  handleCancelAgentConfirmation,
} from "@/server/domains/agents/handlers/confirmations";
import {
  handleDeleteAgentThread,
  handleListAgentMessages,
  handleListAgentThreads,
} from "@/server/domains/agents/handlers/read";

export const agentsSubRouter = new Hono();

agentsSubRouter.post("/:organizationId/agents/chat", handleAgentChat);
agentsSubRouter.post("/:organizationId/agents/confirmations/:confirmationId/approve", handleApproveAgentConfirmation);
agentsSubRouter.post("/:organizationId/agents/confirmations/:confirmationId/cancel", handleCancelAgentConfirmation);
agentsSubRouter.get("/:organizationId/agents/threads", handleListAgentThreads);
agentsSubRouter.get("/:organizationId/agents/threads/:threadId/messages", handleListAgentMessages);
agentsSubRouter.delete("/:organizationId/agents/threads/:threadId", handleDeleteAgentThread);
