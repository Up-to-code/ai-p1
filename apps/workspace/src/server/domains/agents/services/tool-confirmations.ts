import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { MobileRequestContext } from "@/server/middleware/mobile-request-context";
import type { McpToolDefinition } from "@/server/protocols/mcp/tools/catalog";
import { fetchAuthMutation } from "@/server/auth/convex-workos/server";

export type AgentToolConfirmation = {
  confirmationId: string;
  summary: string;
  resource: string;
  action: string;
  approvalType: "user" | "admin";
  inputPreview?: string;
  expiresAt: number;
};

export type AgentToolConfirmationRuntime = {
  organizationId: string;
  threadId: Id<"agentThreads">;
  runId: Id<"agentRuns">;
  requestContext?: MobileRequestContext;
};

export function compactAgentToolPreview(value: unknown, maxLength = 900) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

export async function createAgentToolConfirmation(
  runtime: AgentToolConfirmationRuntime,
  tool: McpToolDefinition,
  input: unknown,
) {
  const expiresAt = Date.now() + 5 * 60 * 1000;
  const inputPreview = compactAgentToolPreview(input, 500);
  const confirmation = await fetchAuthMutation(api.agents.confirmations.createFromHono, {
    organizationId: runtime.organizationId,
    threadId: runtime.threadId,
    runId: runtime.runId,
    tool: tool.name,
    resource: tool.resource,
    action: tool.action,
    riskLevel: tool.riskLevel,
    approvalRequirement: tool.approvalRequirement,
    summary: `${tool.title}: ${compactAgentToolPreview(input, 220)}`,
    inputPreview,
    input,
    requestContext: runtime.requestContext,
    expiresAt,
  });

  return {
    confirmationId: confirmation.id,
    summary: confirmation.summary,
    resource: confirmation.resource,
    action: confirmation.action,
    approvalType: confirmation.approvalRequirement === "admin" ? "admin" as const : "user" as const,
    inputPreview: confirmation.inputPreview,
    expiresAt: confirmation.expiresAt,
  };
}
