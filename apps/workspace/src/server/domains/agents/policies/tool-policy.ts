import type {
  McpPermission,
  McpToolDefinition,
} from "@/server/protocols/mcp/tools/catalog";
import { evaluateAgentToolRisk } from "./risk-policy";

type AgentToolPolicyAdapter = "agent" | "mcp";
type AgentToolPolicyActorType = "user" | "mcpConnection";
type AgentToolPolicyDecisionState =
  | "allowed"
  | "blocked"
  | "requires_user_approval"
  | "requires_admin_approval";

export type AgentToolPolicyInput = {
  adapter: AgentToolPolicyAdapter;
  actorType: AgentToolPolicyActorType;
  organizationId: string;
  tool?: McpToolDefinition;
  permissions?: McpPermission[];
  inputPreview?: string;
};

export type AgentToolPolicyDecision = {
  state: AgentToolPolicyDecisionState;
  reason: string;
  riskLevel?: McpToolDefinition["riskLevel"];
  approvalRequirement?: McpToolDefinition["approvalRequirement"];
};

function hasPermission(permissions: McpPermission[] | undefined, tool: McpToolDefinition) {
  return permissions?.some((permission) =>
    permission.resource === tool.resource && permission.actions.includes(tool.action),
  ) === true;
}

export function evaluateAgentToolPolicy(input: AgentToolPolicyInput): AgentToolPolicyDecision {
  if (!input.organizationId.trim()) {
    return { state: "blocked", reason: "Organization scope is required." };
  }

  if (!input.tool) {
    return { state: "blocked", reason: "Unknown agent tool." };
  }

  const { tool } = input;
  if (!tool.riskLevel || !tool.approvalRequirement || !tool.dataSensitivity) {
    return {
      state: "blocked",
      reason: "Agent tool safety metadata is incomplete.",
    };
  }

  if (!hasPermission(input.permissions, tool)) {
    return {
      state: "blocked",
      reason: `Actor is not allowed to ${tool.action} ${tool.resource}.`,
      riskLevel: tool.riskLevel,
      approvalRequirement: tool.approvalRequirement,
    };
  }

  const agentRisk = input.adapter === "agent"
    ? evaluateAgentToolRisk({ resource: tool.resource, action: tool.action, tool: tool.name })
    : { state: "allowed" as const };
  if (agentRisk.state === "blocked") {
    return {
      state: "blocked",
      reason: agentRisk.reason ?? "This agent action is not available.",
      riskLevel: tool.riskLevel,
      approvalRequirement: tool.approvalRequirement,
    };
  }

  if (input.adapter === "agent" && agentRisk.category === "member_delete") {
    return {
      state: "requires_user_approval",
      reason: agentRisk.reason ?? "This agent action requires user approval before execution.",
      riskLevel: tool.riskLevel,
      approvalRequirement: tool.approvalRequirement,
    };
  }

  if (tool.approvalRequirement === "admin") {
    return {
      state: "requires_admin_approval",
      reason: "This high-impact agent action requires admin approval.",
      riskLevel: tool.riskLevel,
      approvalRequirement: tool.approvalRequirement,
    };
  }

  if (input.adapter === "mcp" && tool.action !== "read") {
    return {
      state: "requires_user_approval",
      reason: "External MCP write actions require approval before execution.",
      riskLevel: tool.riskLevel,
      approvalRequirement: tool.approvalRequirement,
    };
  }

  if (input.adapter !== "agent" && tool.approvalRequirement === "user") {
    return {
      state: "requires_user_approval",
      reason: "This agent action requires user approval before execution.",
      riskLevel: tool.riskLevel,
      approvalRequirement: tool.approvalRequirement,
    };
  }

  return {
    state: "allowed",
    reason: "Agent tool policy allowed the call.",
    riskLevel: tool.riskLevel,
    approvalRequirement: tool.approvalRequirement,
  };
}
