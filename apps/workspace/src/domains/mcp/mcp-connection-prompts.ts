import { resolveAuthTopology } from "@qentrah/auth/config";

export const defaultMcpEndpoint = resolveAuthTopology().mcpResourceUrl;

export type McpPromptPreset = "general" | "client" | "calendar" | "full";

type McpPromptInput = {
  agentName?: string;
  endpoint?: string;
  preset?: McpPromptPreset;
  permissionSummary?: string;
};

const presetPurpose: Record<McpPromptPreset, string> = {
  general: "general workspace assistance",
  client: "client follow-up, CRM review, and task creation",
  calendar: "calendar review, scheduling support, and task due-date coordination",
  full: "broad workspace operations across clients, projects, tasks, documents, and calendar",
};

const presetToolHints: Record<McpPromptPreset, string[]> = {
  general: ["organization_info", "projects_list", "tasks_list"],
  client: ["organization_info", "clients_list", "clients_search", "tasks_create"],
  calendar: ["organization_info", "calendar_list", "calendar_get", "tasks_update"],
  full: ["organization_info", "clients_list", "projects_list", "tasks_list", "tasks_create"],
};

function normalizedAgentName(agentName?: string) {
  const name = agentName?.trim();
  return name || "Qentrah agent";
}

export function buildMcpSetupPrompt({
  agentName,
  endpoint = defaultMcpEndpoint,
  preset = "general",
  permissionSummary,
}: McpPromptInput = {}) {
  const name = normalizedAgentName(agentName);
  const purpose = presetPurpose[preset];
  const tools = presetToolHints[preset].join(", ");

  return [
    `Create an MCP connection named "${name}" for Qentrah.`,
    "",
    `MCP server URL: ${endpoint}`,
    `Purpose: ${purpose}.`,
    permissionSummary ? `Requested permissions: ${permissionSummary}.` : "",
    "",
    "Connection rules:",
    "1. Use OAuth/browser sign-in. Do not ask for an API key or secret URL.",
    "2. During consent, select the Qentrah organization and only the scope needed for this agent.",
    "3. Request the minimum permissions needed for the task.",
    "4. Prefer these tools first when available: " + tools + ".",
    "5. After connecting, call organization_info before doing workspace work so you can confirm the approved scope and permissions.",
    "",
    "If the client supports command setup, use:",
    `codex mcp add qentrah --url ${endpoint}`,
    "codex mcp login qentrah",
  ].filter(Boolean).join("\n");
}

export function buildMcpConfigJson(endpoint = defaultMcpEndpoint) {
  return JSON.stringify(
    {
      mcpServers: {
        qentrah: {
          url: endpoint,
        },
      },
    },
    null,
    2,
  );
}

export function buildOpenAiMcpToolPrompt({
  agentName,
  endpoint = defaultMcpEndpoint,
  preset = "general",
}: McpPromptInput = {}) {
  return JSON.stringify(
    {
      model: "gpt-5",
      input: `Use ${normalizedAgentName(agentName)} to help with ${presetPurpose[preset]}. First call organization_info, then proceed within the approved scope.`,
      tools: [
        {
          type: "mcp",
          server_label: "qentrah",
          server_url: endpoint,
          allowed_tools: presetToolHints[preset],
          require_approval: "never",
        },
      ],
    },
    null,
    2,
  );
}
