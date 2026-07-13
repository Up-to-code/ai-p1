import type { McpGrantAuthorization } from "@qentrah/mcp-contracts";
import { logger } from "@/lib/logger";
import type { McpBearerIdentity } from "../authorization/bearer-auth";
import type { McpExecutor } from "../executor/convex-executor";
import {
  enforceMcpRequestSize,
  McpRequestPolicyError,
  withMcpDeadline,
} from "./request-policy";

export type McpHttpTopology = {
  workspaceOrigin: string;
  mcpProtectedResourceMetadataUrl: string;
};

export type McpHttpHandlerDependencies = {
  topology: McpHttpTopology;
  verifyBearer: (authorization: string | null) => Promise<McpBearerIdentity | null>;
  createExecutor: (identity: McpBearerIdentity) => McpExecutor;
  handleProtocol: (
    request: Request,
    grant: McpGrantAuthorization,
    executor: McpExecutor,
  ) => Promise<Response>;
  createRequestId?: () => string;
};

class McpGrantAccessError extends Error {
  constructor() {
    super("MCP grant access denied.");
    this.name = "McpGrantAccessError";
  }
}

function jsonError(
  code: string,
  status: number,
  requestId: string,
  headers?: HeadersInit,
) {
  return Response.json({ error: code, requestId }, { status, headers });
}

function isMcpRateLimit(error: unknown) {
  return error instanceof Error && error.message.includes("MCP_RATE_LIMITED");
}

function responseHeaders(request: Request, topology: McpHttpTopology, requestId: string) {
  const headers = new Headers({
    "cache-control": "no-store",
    "access-control-expose-headers": "www-authenticate, retry-after, x-request-id",
    "x-content-type-options": "nosniff",
    "x-request-id": requestId,
  });
  const origin = request.headers.get("origin");
  if (origin === topology.workspaceOrigin) {
    headers.set("access-control-allow-origin", origin);
    headers.set("vary", "origin");
  }
  return headers;
}

function appendResponseHeaders(response: Response, headers: Headers) {
  const next = new Headers(response.headers);
  headers.forEach((value, key) => next.set(key, value));
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: next,
  });
}

/** Creates the bearer-only Next.js MCP HTTP handler. */
export function createMcpHttpHandler(dependencies: McpHttpHandlerDependencies) {
  return async function handleMcpHttpRequest(request: Request): Promise<Response> {
    const requestId = request.headers.get("x-request-id")?.trim().slice(0, 128)
      || dependencies.createRequestId?.()
      || crypto.randomUUID();
    const headers = responseHeaders(request, dependencies.topology, requestId);

    if (request.method === "OPTIONS") {
      headers.set("access-control-allow-headers", "authorization, content-type, mcp-protocol-version");
      headers.set("access-control-allow-methods", "GET, POST, OPTIONS");
      headers.set("access-control-max-age", "600");
      return new Response(null, { status: 204, headers });
    }

    try {
      return await withMcpDeadline((async () => {
        const identity = await dependencies.verifyBearer(request.headers.get("authorization"));
        if (!identity) {
          headers.set(
            "www-authenticate",
            `Bearer resource_metadata="${dependencies.topology.mcpProtectedResourceMetadataUrl}"`,
          );
          return jsonError("invalid_token", 401, requestId, headers);
        }

        const limitedRequest = await enforceMcpRequestSize(request);
        const executor = dependencies.createExecutor(identity);
        let grant: McpGrantAuthorization;
        try {
          grant = await executor.authorizeGrant();
        } catch (error) {
          if (isMcpRateLimit(error)) throw error;
          throw new McpGrantAccessError();
        }
        const response = await dependencies.handleProtocol(limitedRequest, grant, executor);
        return appendResponseHeaders(response, headers);
      })());
    } catch (error) {
      if (error instanceof McpRequestPolicyError) {
        return jsonError(error.code, error.status, requestId, headers);
      }
      if (isMcpRateLimit(error)) {
        headers.set("retry-after", "60");
        return jsonError("rate_limited", 429, requestId, headers);
      }
      if (error instanceof McpGrantAccessError) {
        return jsonError("access_denied", 403, requestId, headers);
      }
      logger.error(
        "MCP request failed",
        { module: "mcp", requestId },
        error instanceof Error ? error : undefined,
      );
      return jsonError("internal_error", 500, requestId, headers);
    }
  };
}
