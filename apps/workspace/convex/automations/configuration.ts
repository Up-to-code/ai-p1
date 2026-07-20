import type { Doc } from "../_generated/dataModel";

type AutomationNode = Doc<"automations">["nodes"][number];

function required(config: Record<string, string>, key: string, label: string) {
  return config[key]?.trim() ? null : `${label} is required.`;
}

export function automationNodeConfigurationProblems(node: AutomationNode) {
  const problems: string[] = [];
  const add = (problem: string | null) => {
    if (problem) problems.push(`${node.label}: ${problem}`);
  };

  if (node.type === "domain_event") {
    add(required(node.config, "eventType", "Event type"));
  } else if (node.type === "schedule") {
    const minutes = Number(node.config.intervalMinutes);
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 43_200) {
      problems.push(`${node.label}: interval must be between 1 and 43,200 minutes.`);
    }
  } else if (node.type === "google_sheets") {
    add(required(node.config, "connectionId", "Google Sheets connection"));
    add(required(node.config, "spreadsheetId", "Spreadsheet ID"));
    add(required(node.config, "range", "Sheet range"));
  } else if (node.type === "agent") {
    add(required(node.config, "agentId", "Published agent"));
    add(required(node.config, "prompt", "Agent prompt"));
  } else if (node.type === "whatsapp_message") {
    add(required(node.config, "connectionId", "WhatsApp connection"));
    add(required(node.config, "to", "Recipient"));
    add(required(node.config, "message", "Message"));
  } else if (node.type === "update_task") {
    add(required(node.config, "status", "Task status"));
  } else if (node.type === "create_task") {
    add(required(node.config, "title", "Task title"));
  } else if (node.type === "create_document") {
    add(required(node.config, "title", "Document title"));
  } else if (node.type === "update_client") {
    add(required(node.config, "status", "Client status"));
  }
  return problems;
}

export function automationConfigurationProblems(nodes: AutomationNode[]) {
  return nodes.flatMap(automationNodeConfigurationProblems);
}
