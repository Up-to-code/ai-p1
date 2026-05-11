import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { createMcpConnectionSchema, updateMcpConnectionSchema } from "../validation/mcp-connection.schema";
import {
  createMcpConnection,
  listMcpConnections,
  revokeMcpConnection,
  rotateMcpConnection,
  updateMcpConnection,
} from "../services/mcp-connections";

function handleError(c: Context, error: unknown) {
  const message = error instanceof Error ? error.message : "Agent link action failed.";
  return c.json({ error: message }, 500 as ContentfulStatusCode);
}

function mcpUrl(c: Context, publicId: string, secret: string) {
  const origin = new URL(c.req.url).origin;
  return `${origin}/api/mcp/agent/${encodeURIComponent(publicId)}/${encodeURIComponent(secret)}`;
}

export async function handleListMcpConnections(c: Context) {
  const organizationId = c.req.param("organizationId");
  if (!organizationId) return c.json({ error: "Organization id is required." }, 400);

  try {
    const connections = await listMcpConnections(organizationId);
    return c.json({ connections });
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleCreateMcpConnection(c: Context) {
  const organizationId = c.req.param("organizationId");
  if (!organizationId) return c.json({ error: "Organization id is required." }, 400);
  const parsed = await validateJsonBody(c, createMcpConnectionSchema, "Invalid agent link payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const result = await createMcpConnection(organizationId, parsed.data);
    return c.json({
      connection: result.connection,
      agentLink: mcpUrl(c, result.connection.publicId, result.secret),
    });
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleUpdateMcpConnection(c: Context) {
  const organizationId = c.req.param("organizationId");
  const connectionId = c.req.param("connectionId");
  if (!organizationId || !connectionId) return c.json({ error: "Organization and connection ids are required." }, 400);
  const parsed = await validateJsonBody(c, updateMcpConnectionSchema, "Invalid agent link payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const connection = await updateMcpConnection(organizationId, connectionId, parsed.data);
    return c.json({ connection });
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleRevokeMcpConnection(c: Context) {
  const organizationId = c.req.param("organizationId");
  const connectionId = c.req.param("connectionId");
  if (!organizationId || !connectionId) return c.json({ error: "Organization and connection ids are required." }, 400);

  try {
    const result = await revokeMcpConnection(organizationId, connectionId);
    return c.json(result);
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleRotateMcpConnection(c: Context) {
  const organizationId = c.req.param("organizationId");
  const connectionId = c.req.param("connectionId");
  if (!organizationId || !connectionId) return c.json({ error: "Organization and connection ids are required." }, 400);

  try {
    const result = await rotateMcpConnection(organizationId, connectionId);
    return c.json({
      connection: result.connection,
      agentLink: mcpUrl(c, result.connection.publicId, result.secret),
    });
  } catch (error) {
    return handleError(c, error);
  }
}
