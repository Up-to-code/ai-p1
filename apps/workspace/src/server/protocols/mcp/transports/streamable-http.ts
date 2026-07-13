import type { McpGrantAuthorization } from "@qentrah/mcp-contracts";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import type { McpExecutor, McpToolInput } from "../executor/convex-executor";

const passthroughInput = z.object({}).passthrough();

function textContent(value: unknown) {
  return {
    content: [{
      type: "text" as const,
      text: typeof value === "string" ? value : JSON.stringify(value, null, 2),
    }],
  };
}

function toolFailureMessage(error: unknown) {
  return error instanceof Error && error.message.includes("MCP_RATE_LIMITED")
    ? "The approved agent rate limit was reached. Retry later."
    : "The Qentrah tool request could not be completed.";
}

/**
 * Handles one stateless Streamable HTTP exchange. Only tools returned by the
 * canonical Convex grant authorization are registered for this connection.
 */
export async function handleStreamableMcpRequest(
  request: Request,
  grant: McpGrantAuthorization,
  executor: Pick<McpExecutor, "executeTool">,
): Promise<Response> {
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
      async (input: McpToolInput) => {
        try {
          return textContent(await executor.executeTool(tool.name, input));
        } catch (error) {
          return { isError: true, ...textContent(toolFailureMessage(error)) };
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
      tools: grant.tools.map(({ name, title, resource, action }) => ({
        name,
        title,
        resource,
        action,
      })),
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
