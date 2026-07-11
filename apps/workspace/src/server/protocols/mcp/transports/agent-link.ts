import type { Context, Hono } from "hono";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { convexHttp } from "@/server/convex/http-client";
import { allowedMcpTools, getMcpToolDefinition } from "../tools/catalog";

const JSON_RPC_INTERNAL_ERROR = -32603;
const JSON_RPC_INVALID_REQUEST = -32600;
const JSON_RPC_METHOD_NOT_ALLOWED = -32000;
const JSON_RPC_UNAUTHORIZED = -32001;

function jsonRpcError(code: number, message: string, status: number, id: unknown = null) {
  return Response.json(
    {
      jsonrpc: "2.0",
      error: { code, message },
      id,
    },
    { status },
  );
}

function textContent(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: typeof value === "string" ? value : JSON.stringify(value, null, 2),
      },
    ],
  };
}

function errorContent(error: unknown) {
  return {
    isError: true,
    ...textContent(error instanceof Error ? error.message : "Tool call failed."),
  };
}

function requestBaseUrl(c: Context) {
  const url = new URL(c.req.url);
  return `${url.protocol}//${url.host}`;
}

const passthroughInputSchema = z.object({}).passthrough();

function mcpInputSchema(tool: ReturnType<typeof allowedMcpTools>[number]) {
  return tool.inputSchema
    ? z.object(tool.inputSchema).passthrough()
    : passthroughInputSchema;
}

export function handleMcpMethodNotAllowed() {
  return jsonRpcError(
    JSON_RPC_METHOD_NOT_ALLOWED,
    "Method not allowed. Use POST for this stateless MCP endpoint.",
    405,
  );
}

/** Registers the public, stateless MCP agent-link transport under the API app. */
export function registerMcpAgentTransport(app: Hono) {
  app.get("/mcp/agent/:publicId/:secret", handleMcpMethodNotAllowed);
  app.delete("/mcp/agent/:publicId/:secret", handleMcpMethodNotAllowed);
  app.post("/mcp/agent/:publicId/:secret", handleMcpAgent);
}

export async function handleMcpAgent(c: Context) {
  const publicId = c.req.param("publicId");
  const secret = c.req.param("secret");
  if (!publicId || !secret) {
    return jsonRpcError(JSON_RPC_INVALID_REQUEST, "Agent link is required.", 400);
  }

  const validation = await convexHttp.query(api.mcp.connections.validateConnection, {
    publicId,
    secret,
  });
  if (!validation.ok || !validation.permissions) {
    return jsonRpcError(JSON_RPC_UNAUTHORIZED, "Agent link is not available.", 401);
  }

  const server = new McpServer({
    name: `Qentrah ${validation.name ?? "Agent Link"}`,
    version: "1.0.0",
  });

  for (const tool of allowedMcpTools(validation.permissions)) {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: mcpInputSchema(tool),
        annotations: tool.destructive ? { destructiveHint: true } : undefined,
        _meta: validation.instructions ? { "qentrah/instructions": validation.instructions } : undefined,
      },
      async (input: Record<string, unknown>) => {
        try {
          const result = await convexHttp.action(api.mcp.tools.callTool, {
            publicId,
            secret,
            tool: tool.name,
            input,
            appBaseUrl: requestBaseUrl(c),
          });
          return textContent(result);
        } catch (error) {
          return errorContent(error);
        }
      },
    );
  }

  server.registerTool(
    "tools_allowed",
    {
      title: "Allowed work",
      description: "Describe what this agent link can do.",
      inputSchema: passthroughInputSchema,
      _meta: validation.instructions ? { "qentrah/instructions": validation.instructions } : undefined,
    },
    async () => {
      const tools = allowedMcpTools(validation.permissions ?? []).map((tool) => ({
        name: tool.name,
        title: tool.title,
        resource: tool.resource,
        action: tool.action,
      }));
      const organizationInfo = getMcpToolDefinition("organization_info");
      return textContent({ tools, organizationInfo });
    },
  );

  const transport = new WebStandardStreamableHTTPServerTransport({
    enableJsonResponse: true,
    sessionIdGenerator: undefined,
  });
  try {
    await server.connect(transport);
    return await transport.handleRequest(c.req.raw);
  } catch (error) {
    return jsonRpcError(
      JSON_RPC_INTERNAL_ERROR,
      error instanceof Error ? error.message : "MCP request failed.",
      500,
    );
  } finally {
    await server.close();
  }
}
