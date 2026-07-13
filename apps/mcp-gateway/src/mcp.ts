import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import type { McpGrantAuthorization } from "@qentrah/mcp-contracts";
import type { GatewayConfig } from "./config.js";
import type { GatewayIdentity } from "./auth.js";
import { executeTool } from "./convex.js";

const passthroughInput = z.object({}).passthrough();

function textContent(value: unknown) {
  return {
    content: [{
      type: "text" as const,
      text: typeof value === "string" ? value : JSON.stringify(value, null, 2),
    }],
  };
}

export async function handleMcpRequest(
  request: Request,
  identity: GatewayIdentity,
  grant: McpGrantAuthorization,
  config: GatewayConfig,
) {
  const server = new McpServer({ name: "Qentrah MCP", version: "1.0.0" });

  for (const tool of grant.tools) {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: passthroughInput,
        annotations: {
          readOnlyHint: tool.action === "read",
          openWorldHint: false,
          destructiveHint: tool.destructive === true || tool.action === "delete",
        },
      },
      async (input: Record<string, unknown>) => {
        try {
          return textContent(await executeTool(identity, config, tool.name, input));
        } catch (error) {
          const message = error instanceof Error && error.message.includes("MCP_RATE_LIMITED")
            ? "The approved agent rate limit was reached. Retry later."
            : "The Qentrah tool request could not be completed.";
          return { isError: true, ...textContent(message) };
        }
      },
    );
  }

  server.registerTool(
    "tools_allowed",
    {
      title: "Allowed work",
      description: "Describe the work approved for this OAuth connection.",
      inputSchema: z.object({}),
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async () => textContent({
      organizationId: grant.organizationId,
      expiresAt: grant.expiresAt,
      tools: grant.tools.map(({ name, title, resource, action }) => ({ name, title, resource, action })),
    }),
  );

  const transport = new WebStandardStreamableHTTPServerTransport({
    enableJsonResponse: true,
    sessionIdGenerator: undefined,
  });
  try {
    await server.connect(transport);
    return await transport.handleRequest(request);
  } finally {
    await server.close();
  }
}
