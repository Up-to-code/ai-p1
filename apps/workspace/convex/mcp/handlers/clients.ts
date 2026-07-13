import type { QueryCtx, MutationCtx } from "../../_generated/server";
import type { Id } from "../../_generated/dataModel";
import { internal } from "../../_generated/api";
import { presentWorkspaceRecord } from "../../shared/present";
import { assertActiveWorkspaceRecord, assertPublicWorkspaceRecord } from "../../workspace/businessData";
import { clientInput, clientPatchInput, listLimit, listCursor, requiredString, searchTerm } from "../toolInputs";
import { mcpPublicWorkspacePage, mcpPublicWorkspaceSearchResult } from "../readSurface";
import {
  type ReadHandler, type WriteHandler, type ReadToolArgs, type WriteToolArgs,
  TOOL_SCAN_LIMIT, clientSearchValues, audit,
} from "./shared";
import { isScopedClient, scopeActorUserId } from "../scopePolicy";

export const clientsList: ReadHandler = async (ctx: QueryCtx, args: ReadToolArgs) => {
  const limit = listLimit(args.input);
  const search = searchTerm(args.input);
  const scope = args.scopePolicy;
  if (scope.scopeType !== "organization") {
    const clients = [];
    for (const clientId of scope.clientIds) {
      const client = await ctx.db.get(clientId as Id<"clients">);
      if (client && client.organizationId === args.organizationId && !client.deletedAt && client.recordState !== "deleted") clients.push(client);
    }
    const filtered = search
      ? clients.filter((client) => clientSearchValues(client).some((value) => value.toLowerCase().includes(search)))
      : clients;
    return mcpPublicWorkspacePage({ page: filtered.slice(0, limit), isDone: true, continueCursor: "" });
  }
  if (!search) {
    const page = await ctx.db
      .query("clients")
      .withIndex("by_organization_updated", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .paginate({ numItems: limit, cursor: listCursor(args.input) });
    return mcpPublicWorkspacePage(page);
  }
  const clients = await ctx.db
    .query("clients")
    .withIndex("by_organization_updated", (q) => q.eq("organizationId", args.organizationId))
    .order("desc")
    .take(TOOL_SCAN_LIMIT);
  return mcpPublicWorkspaceSearchResult(clients, { search, limit, searchValues: clientSearchValues });
};

export const clientsGet: ReadHandler = async (ctx: QueryCtx, args: ReadToolArgs) => {
  const client = await ctx.db.get(requiredString(args.input, "clientId") as Id<"clients">);
  if (client && (!isScopedClient(args.scopePolicy, client._id) || client.recordState === "deleted")) throw new Error("Client was not found.");
  return presentWorkspaceRecord(assertPublicWorkspaceRecord(assertActiveWorkspaceRecord(client, args.organizationId, "Client"), "Client"));
};

export const clientsCreate: WriteHandler = async (ctx: MutationCtx, args: WriteToolArgs) => {
  const client = clientInput(args.input);
  const result = await ctx.runMutation(internal.clients.write.createInternal, {
    organizationId: args.organizationId,
    input: { ...client, visibility: "workspace", source: "mcp" },
    actorUserId: scopeActorUserId(args.scopePolicy),
  });
  await audit(ctx, args.organizationId, args.connectionId, "client.create", result.id, `Created client ${client.name}.`);
  return presentWorkspaceRecord(result);
};

export const clientsUpdate: WriteHandler = async (ctx: MutationCtx, args: WriteToolArgs) => {
  const clientId = requiredString(args.input, "clientId") as Id<"clients">;
  const client = clientPatchInput(args.input);
  const result = await ctx.runMutation(internal.clients.write.updateInternal, {
    organizationId: args.organizationId,
    clientId,
    input: client,
    actorUserId: scopeActorUserId(args.scopePolicy),
  });
  await audit(ctx, args.organizationId, args.connectionId, "client.update", clientId, `Updated client ${client.name ?? ""}.`);
  return presentWorkspaceRecord(result);
};

export const clientsDelete: WriteHandler = async (ctx: MutationCtx, args: WriteToolArgs) => {
  const clientId = requiredString(args.input, "clientId") as Id<"clients">;
  const result = await ctx.runMutation(internal.clients.write.deleteInternal, {
    organizationId: args.organizationId,
    clientId,
    actorUserId: scopeActorUserId(args.scopePolicy),
  });
  await audit(ctx, args.organizationId, args.connectionId, "client.delete", clientId, `Deleted client.`);
  return result;
};
