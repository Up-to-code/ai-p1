import { Hono } from "hono";
import {
  handleCreateMcpConnection,
  handleListMcpConnections,
  handleRevokeMcpConnection,
  handleRotateMcpConnection,
  handleUpdateMcpConnection,
} from "@/server/domains/mcpConnections/handlers/mcp-connections";

export const mcpSubRouter = new Hono();

mcpSubRouter.get("/:organizationId/mcp-connections", handleListMcpConnections);
mcpSubRouter.post("/:organizationId/mcp-connections", handleCreateMcpConnection);
mcpSubRouter.patch("/:organizationId/mcp-connections/:connectionId", handleUpdateMcpConnection);
mcpSubRouter.delete("/:organizationId/mcp-connections/:connectionId", handleRevokeMcpConnection);
mcpSubRouter.post("/:organizationId/mcp-connections/:connectionId/rotate", handleRotateMcpConnection);
