import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { automationConfigurationProblems } from "./configuration";
import { graphProblem } from "./graph";

export async function automationEnablementProblems(
  ctx: MutationCtx,
  automation: Doc<"automations">,
) {
  const problems = [
    ...(graphProblem(automation.nodes, automation.edges)
      ? [graphProblem(automation.nodes, automation.edges)!]
      : []),
    ...automationConfigurationProblems(automation.nodes),
  ];

  for (const node of automation.nodes) {
    if (node.type === "agent" && node.config.agentId) {
      const agentId = ctx.db.normalizeId("customAgents", node.config.agentId);
      const agent = agentId ? await ctx.db.get(agentId) : null;
      if (
        !agent ||
        agent.organizationId !== automation.organizationId ||
        agent.ownerUserId !== automation.createdByUserId ||
        agent.status !== "published" ||
        !agent.publishedInstructions
      ) {
        problems.push(
          `${node.label}: choose one of the creator's currently published agents.`,
        );
      }
    }
    if (
      (node.type === "google_sheets" || node.type === "whatsapp_message") &&
      node.config.connectionId
    ) {
      const connectionId = ctx.db.normalizeId(
        "automationConnections",
        node.config.connectionId,
      );
      const connection = connectionId ? await ctx.db.get(connectionId) : null;
      const provider =
        node.type === "google_sheets" ? "google_sheets" : "whatsapp";
      if (
        !connection ||
        connection.organizationId !== automation.organizationId ||
        connection.ownerUserId !== automation.createdByUserId ||
        connection.provider !== provider ||
        connection.status !== "active"
      ) {
        problems.push(`${node.label}: choose an active ${provider} connection.`);
      }
    }
  }
  return Array.from(new Set(problems));
}
