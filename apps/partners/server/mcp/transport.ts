import type { Context } from "hono";
import { partnerMcpConnectionsRepository } from "./connections";
import { callPartnerMcpTool, partnerMcpToolDefinitions } from "./tools";

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
};

function rpc(id: JsonRpcRequest["id"], result: unknown) {
  return { jsonrpc: "2.0", id: id ?? null, result };
}

function rpcError(id: JsonRpcRequest["id"], code: number, message: string) {
  return { jsonrpc: "2.0", id: id ?? null, error: { code, message } };
}

export function handleMcpMethodNotAllowed(c: Context) {
  return c.json({ error: "mcp_method_not_allowed" }, 405);
}

export async function handlePartnerMcp(c: Context) {
  const startedAt = Date.now();
  const publicId = c.req.param("publicId");
  const secret = c.req.param("secret");
  let connectionId: string | undefined;
  let request: JsonRpcRequest | undefined;
  let toolName: string | undefined;
  let logged = false;

  try {
    if (!publicId || !secret) throw new Error("MCP link is required.");
    const auth = await partnerMcpConnectionsRepository.authenticate(publicId, secret);
    connectionId = auth.connection.id;
    request = await c.req.json<JsonRpcRequest>();
    const method = request.method ?? "";

    if (method === "initialize") {
      await partnerMcpConnectionsRepository.markUsed(connectionId);
      return c.json(rpc(request.id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "qentrah-partners-mcp", version: "0.1.0" },
      }));
    }

    if (method === "notifications/initialized") {
      return c.body(null, 202);
    }

    if (method === "tools/list") {
      await partnerMcpConnectionsRepository.markUsed(connectionId);
      return c.json(rpc(request.id, { tools: partnerMcpToolDefinitions }));
    }

    if (method === "tools/call") {
      const params = request.params ?? {};
      toolName = typeof params.name === "string" ? params.name : undefined;
      if (!toolName) return c.json(rpcError(request.id, -32602, "Tool name is required."), 400);
      const result = await callPartnerMcpTool(
        { authSubject: auth.authSubject, permissions: auth.connection.permissions },
        toolName,
        params.arguments ?? {},
      );
      await partnerMcpConnectionsRepository.markUsed(connectionId);
      return c.json(rpc(request.id, result));
    }

    return c.json(rpcError(request.id, -32601, `Unsupported MCP method: ${method}`), 404);
  } catch (error) {
    const message = error instanceof Error ? error.message : "MCP request failed.";
    await partnerMcpConnectionsRepository.log({
      connectionId,
      publicId,
      method: request?.method ?? "unknown",
      toolName,
      status: 400,
      latencyMs: Date.now() - startedAt,
      error: message,
    });
    logged = true;
    return c.json(rpcError(request?.id, -32000, message), 400);
  } finally {
    if (connectionId && !logged) {
      await partnerMcpConnectionsRepository.log({
        connectionId,
        publicId,
        method: request?.method ?? "unknown",
        toolName,
        status: 200,
        latencyMs: Date.now() - startedAt,
      });
    }
  }
}
