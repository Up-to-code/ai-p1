import type { Context } from "hono";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { toFetchResponse, toReqRes } from "fetch-to-node";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { convexHttp } from "@/server/convex/http-client";
import { allowedMcpTools, getMcpToolDefinition } from "../tools/catalog";

function jsonRpcMethodNotAllowed() {
  return Response.json(
    {
      jsonrpc: "2.0",
      error: { code: -32000, message: "Method not allowed. Use POST for this stateless MCP endpoint." },
      id: null,
    },
    { status: 405 },
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
  return jsonRpcMethodNotAllowed();
}

export async function handleMcpAgent(c: Context) {
  const publicId = c.req.param("publicId");
  const secret = c.req.param("secret");
  if (!publicId || !secret) return c.json({ error: "Agent link is required." }, 400);

  const validation = await convexHttp.query(api.mcp.connections.validateConnection, {
    publicId,
    secret,
  });
  if (!validation.ok || !validation.permissions) {
    return c.json({ error: "Agent link is not available." }, 401);
  }

  const server = new McpServer({
    name: `Anan ${validation.name ?? "Agent Link"}`,
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
      },
      async (input: Record<string, unknown>) => {
        const result = await convexHttp.action(api.mcp.tools.callTool, {
          publicId,
          secret,
          tool: tool.name,
          input,
          appBaseUrl: requestBaseUrl(c),
        });
        return textContent(result);
      },
    );
  }

  server.registerTool(
    "tools_allowed",
    {
      title: "Allowed work",
      description: "Describe what this agent link can do.",
      inputSchema: {},
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

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });
  const { req, res } = toReqRes(c.req.raw);
  const responsePromise = toFetchResponse(res);
  await server.connect(transport);
  await transport.handleRequest(req, res);
  const response = await responsePromise;
  await server.close();
  return response;
}
