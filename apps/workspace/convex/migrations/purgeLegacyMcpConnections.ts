import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

const MAX_BATCH = 5_000;

/** One-time destructive cutover requested for secret-bearing MCP connections. */
export const purgeLegacyMcpConnections = internalMutation({
  args: {},
  returns: v.object({ deletedConnections: v.number(), deletedAuditEvents: v.number() }),
  handler: async (ctx) => {
    const connections = await ctx.db.query("organizationMcpConnections").take(MAX_BATCH);
    const connectionIds = new Set(connections.map((connection) => String(connection._id)));
    for (const connection of connections) await ctx.db.delete(connection._id);

    const auditEvents = await ctx.db.query("organizationAuditEvents").take(MAX_BATCH);
    const legacyAuditEvents = auditEvents.filter((event) =>
      connectionIds.has(event.target) ||
      Boolean(event.actorMcpConnectionId && connectionIds.has(event.actorMcpConnectionId)) ||
      event.action.startsWith("mcpConnection."),
    );
    for (const event of legacyAuditEvents) await ctx.db.delete(event._id);

    return {
      deletedConnections: connections.length,
      deletedAuditEvents: legacyAuditEvents.length,
    };
  },
});
