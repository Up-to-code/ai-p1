import type { Context } from "hono";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { fetchAuthMutation } from "@/server/auth/better-auth/server";
import { getMobileRequestContext } from "@/server/middleware/mobile-request-context";
import { executeConfirmedAgentTool, type AgentToolResult } from "./tool-adapter";

async function recordConfirmedTool(
  organizationId: string,
  threadId: Id<"agentThreads">,
  runId: Id<"agentRuns">,
  result: AgentToolResult,
) {
  await fetchAuthMutation(api.agents.write.recordToolCallFromHono, {
    organizationId,
    threadId,
    runId,
    tool: result.tool.name,
    resource: result.tool.resource,
    action: result.tool.action,
    status: result.status,
    inputPreview: result.input ? JSON.stringify(result.input).slice(0, 900) : undefined,
    outputPreview: result.output ? JSON.stringify(result.output).slice(0, 900) : undefined,
    error: result.error,
  }).catch(() => undefined);
}

export async function approveAgentConfirmation(c: Context, organizationId: string, confirmationId: string) {
  const approved = await fetchAuthMutation(api.agents.confirmations.approveFromHono, {
    organizationId,
    confirmationId: confirmationId as Id<"agentConfirmations">,
  });

  if (!approved.confirmation.threadId || !approved.confirmation.runId) {
    return {
      confirmation: approved.confirmation,
      result: {
        ok: false,
        tool: approved.confirmation.tool,
        approvalOnly: true,
        message: "Approval recorded. External MCP execution is intentionally not replayed from this endpoint.",
      },
    };
  }

  const threadId = approved.confirmation.threadId;
  const runId = approved.confirmation.runId;
  const runtime = {
    honoContext: c,
    organizationId,
    threadId,
    runId,
    requestContext: getMobileRequestContext(c),
    onToolResult: (result: AgentToolResult) =>
      recordConfirmedTool(organizationId, threadId, runId, result),
  };

  const result = await executeConfirmedAgentTool(runtime, approved.confirmation.tool, approved.input);
  if (!result.ok) {
    await fetchAuthMutation(api.agents.confirmations.markFailedFromHono, {
      organizationId,
      confirmationId: confirmationId as Id<"agentConfirmations">,
      error: result.error ?? "Confirmed agent action failed.",
    }).catch(() => undefined);
    throw new Error(result.error ?? "Confirmed agent action failed.");
  }

  const confirmation = await fetchAuthMutation(api.agents.confirmations.markExecutedFromHono, {
    organizationId,
    confirmationId: confirmationId as Id<"agentConfirmations">,
  });

  return { confirmation, result };
}

export async function cancelAgentConfirmation(_c: Context, organizationId: string, confirmationId: string) {
  return fetchAuthMutation(api.agents.confirmations.cancelFromHono, {
    organizationId,
    confirmationId: confirmationId as Id<"agentConfirmations">,
  });
}
