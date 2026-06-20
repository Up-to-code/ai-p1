import type { Context } from "hono";
import { requireOrganizationId } from "@/server/utils/organization/require-organization-id";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { actionErrorJson } from "@/server/utils/response/action-error";
import { createMcpConnectionSchema, updateMcpConnectionSchema } from "../validation/mcp-connection.schema";
import {
  createMcpConnection,
  listMcpConnections,
  revokeMcpConnection,
  rotateMcpConnection,
  updateMcpConnection,
} from "../services/mcp-connections";

function mcpUrl(c: Context, publicId: string, secret: string) {
  const origin = new URL(c.req.url).origin;
  return `${origin}/api/mcp/agent/${encodeURIComponent(publicId)}/${encodeURIComponent(secret)}`;
}

export async function handleListMcpConnections(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;

  try {
    const connections = await listMcpConnections(org.organizationId);
    return c.json({ connections });
  } catch (error) {
    return actionErrorJson(c, error, "Agent link action failed.");
  }
}

export async function handleCreateMcpConnection(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const parsed = await validateJsonBody(c, createMcpConnectionSchema, "Invalid agent link payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const result = await createMcpConnection(org.organizationId, parsed.data);
    return c.json({
      connection: result.connection,
      agentLink: mcpUrl(c, result.connection.publicId, result.secret),
    });
  } catch (error) {
    return actionErrorJson(c, error, "Agent link action failed.");
  }
}

export async function handleUpdateMcpConnection(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const connectionId = c.req.param("connectionId");
  if (!connectionId) return c.json({ error: "Connection id is required." }, 400);
  const parsed = await validateJsonBody(c, updateMcpConnectionSchema, "Invalid agent link payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const connection = await updateMcpConnection(org.organizationId, connectionId, parsed.data);
    return c.json({ connection });
  } catch (error) {
    return actionErrorJson(c, error, "Agent link action failed.");
  }
}

export async function handleRevokeMcpConnection(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const connectionId = c.req.param("connectionId");
  if (!connectionId) return c.json({ error: "Connection id is required." }, 400);

  try {
    const result = await revokeMcpConnection(org.organizationId, connectionId);
    return c.json(result);
  } catch (error) {
    return actionErrorJson(c, error, "Agent link action failed.");
  }
}

export async function handleRotateMcpConnection(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const connectionId = c.req.param("connectionId");
  if (!connectionId) return c.json({ error: "Connection id is required." }, 400);

  try {
    const result = await rotateMcpConnection(org.organizationId, connectionId);
    return c.json({
      connection: result.connection,
      agentLink: mcpUrl(c, result.connection.publicId, result.secret),
    });
  } catch (error) {
    return actionErrorJson(c, error, "Agent link action failed.");
  }
}
