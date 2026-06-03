import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { ToolSet } from "ai";
import type { Context } from "hono";
import { z } from "zod";
import { fetchAuthQuery } from "@/server/auth/convex-workos/server";
import type { MobileRequestContext } from "@/server/middleware/mobile-request-context";
import {
  allowedMcpTools,
  agentToolCatalog,
  type McpToolDefinition,
} from "@/server/protocols/mcp/tools/catalog";
import {
  createAgentToolConfirmation,
  type AgentToolConfirmation,
} from "./tool-confirmations";
import { executeWorkspaceTool, readAgentConversationMemory } from "./tool-executor";
import { toolInputSchemas } from "./tool-inputs";
import { agentToolPermissionsFromCapabilities } from "./tool-permissions";
import { evaluateAgentToolPolicy } from "../policies/tool-policy";

type AgentToolResult = {
  tool: McpToolDefinition;
  status: "allowed" | "blocked" | "failed" | "requires_confirmation" | "requires_admin_approval";
  input?: unknown;
  output?: unknown;
  error?: string;
  confirmationId?: string;
};

type AgentToolRuntime = {
  honoContext?: Context;
  organizationId: string;
  threadId: Id<"agentThreads">;
  runId: Id<"agentRuns">;
  requestContext?: MobileRequestContext;
  onStatus?: (message: string) => Promise<void>;
  onToolResult?: (result: AgentToolResult) => Promise<void>;
  onConfirmationRequired?: (confirmation: AgentToolConfirmation) => Promise<void>;
};

type OrganizationCapabilities = Awaited<ReturnType<typeof fetchAuthQuery<typeof api.organizations.profile.access.getCapabilities>>>;

async function runLoggedTool(runtime: AgentToolRuntime, tool: McpToolDefinition, input: unknown) {
  await runtime.onStatus?.(tool.title);
  const policy = evaluateAgentToolPolicy({
    adapter: "agent",
    actorType: "user",
    organizationId: runtime.organizationId,
    tool,
    permissions: [{ resource: tool.resource, actions: [tool.action] }],
  });
  if (policy.state === "blocked") {
    const message = policy.reason || "This agent action is not available.";
    const result = { tool, status: "blocked" as const, input, error: message };
    await runtime.onToolResult?.(result);
    return { ok: false, tool: tool.name, error: message };
  }

  if (policy.state === "requires_user_approval" || policy.state === "requires_admin_approval") {
    try {
      const confirmation = await createAgentToolConfirmation(runtime, tool, input);
      const status: AgentToolResult["status"] = policy.state === "requires_admin_approval"
        ? "requires_admin_approval"
        : "requires_confirmation";
      const result = {
        tool,
        status,
        input,
        confirmationId: confirmation.confirmationId,
        output: confirmation,
      };
      await runtime.onToolResult?.(result);
      await runtime.onConfirmationRequired?.(confirmation);
      return {
        ok: false,
        tool: tool.name,
        confirmationRequired: true,
        approvalType: policy.state === "requires_admin_approval" ? "admin" : "user",
        confirmation,
        message: policy.reason,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Confirmation could not be created.";
      const result = { tool, status: "failed" as const, input, error: message };
      await runtime.onToolResult?.(result);
      return { ok: false, tool: tool.name, error: message };
    }
  }

  try {
    const output = await executeWorkspaceTool(runtime, tool, input);
    const result = { tool, status: "allowed" as const, input, output };
    await runtime.onToolResult?.(result);
    return { ok: true, tool: tool.name, data: output };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tool failed.";
    const result = { tool, status: "failed" as const, input, error: message };
    await runtime.onToolResult?.(result);
    return { ok: false, tool: tool.name, error: message };
  }
}

export async function executeConfirmedAgentTool(runtime: AgentToolRuntime, toolName: string, input: unknown) {
  const tool = agentToolCatalog.find((item) => item.name === toolName);
  if (!tool) {
    throw new Error("Agent confirmation tool was not found.");
  }

  await runtime.onStatus?.(tool.title);
  try {
    const output = await executeWorkspaceTool(runtime, tool, input);
    const result = { tool, status: "allowed" as const, input, output };
    await runtime.onToolResult?.(result);
    return { ok: true, tool: tool.name, data: output };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tool failed.";
    const result = { tool, status: "failed" as const, input, error: message };
    await runtime.onToolResult?.(result);
    return { ok: false, tool: tool.name, error: message };
  }
}

export async function buildAgentToolSet(runtime: AgentToolRuntime): Promise<ToolSet> {
  const capabilities = await fetchAuthQuery(api.organizations.profile.access.getCapabilities, {
    organizationId: runtime.organizationId,
  });
  const allowedTools = allowedMcpTools(agentToolPermissionsFromCapabilities(capabilities as OrganizationCapabilities), { adapter: "agent" });
  const toolSet: ToolSet = {};

  for (const tool of allowedTools) {
    toolSet[tool.name] = {
      description: [
        tool.description,
        tool.action === "read"
          ? "Use only when the user needs current workspace data."
          : "Use only when the user clearly asked to change workspace data and all required fields are known.",
      ].join(" "),
      inputSchema: toolInputSchemas[tool.name] ?? z.object(tool.inputSchema ?? {}).passthrough(),
      execute: (input: unknown) => runLoggedTool(runtime, tool, input),
    };
  }

  if (allowedTools.some((tool) => tool.resource === "organization" && tool.action === "read")) {
    const memoryTool = agentToolCatalog.find((tool) => tool.name === "organization_info") ?? allowedTools[0];
    toolSet.conversation_memory = {
      description: "Read recent messages, summary, and remembered facts for this current AI thread. Use only for follow-ups, references like this/that/it, or explicit memory requests.",
      inputSchema: z.object({}).passthrough(),
      execute: async () => {
        await runtime.onStatus?.("Reading conversation memory");
        try {
          const output = await readAgentConversationMemory(runtime);
          await runtime.onToolResult?.({
            tool: { ...memoryTool, name: "conversation_memory", title: "Conversation memory", description: "Read current thread memory." },
            status: "allowed",
            output,
          });
          return { ok: true, tool: "conversation_memory", data: output };
        } catch (error) {
          const message = error instanceof Error ? error.message : "Memory lookup failed.";
          await runtime.onToolResult?.({
            tool: { ...memoryTool, name: "conversation_memory", title: "Conversation memory", description: "Read current thread memory." },
            status: "failed",
            error: message,
          });
          return { ok: false, tool: "conversation_memory", error: message };
        }
      },
    };
  }

  return toolSet;
}

export type { AgentToolResult };
