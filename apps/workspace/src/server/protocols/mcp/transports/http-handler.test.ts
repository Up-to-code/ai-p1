import type { McpGrantAuthorization } from "@qentrah/mcp-contracts";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { McpBearerIdentity } from "../authorization/bearer-auth";
import type { McpExecutor } from "../executor/convex-executor";
import { createMcpHttpHandler, type McpHttpHandlerDependencies } from "./http-handler";

const identity: McpBearerIdentity = {
  kind: "bearer",
  token: "access-token",
};

const grant: McpGrantAuthorization = {
  grantId: "grant_1",
  organizationId: "org_1",
  clientId: "client_1",
  userId: "user_1",
  expiresAt: 2_000_000_000_000,
  tools: [{
    name: "tasks_list",
    title: "List tasks",
    description: "List workspace tasks.",
    resource: "task",
    action: "read",
  }],
};

function setup() {
  const executor: McpExecutor = {
    authorizeGrant: vi.fn().mockResolvedValue(grant),
    executeTool: vi.fn(),
  };
  const dependencies: McpHttpHandlerDependencies = {
    topology: {
      workspaceOrigin: "https://app.qentrah.com",
      mcpProtectedResourceMetadataUrl:
        "https://app.qentrah.com/.well-known/oauth-protected-resource/api/mcp",
    },
    verifyBearer: vi.fn().mockResolvedValue(identity),
    createExecutor: vi.fn().mockReturnValue(executor),
    handleProtocol: vi.fn().mockResolvedValue(Response.json({ jsonrpc: "2.0", id: 1, result: {} })),
    createRequestId: () => "request_1",
  };
  return { dependencies, executor, handler: createMcpHttpHandler(dependencies) };
}

describe("workspace MCP HTTP transport", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("challenges requests without a bearer token and ignores cookies", async () => {
    const { dependencies, handler } = setup();
    vi.mocked(dependencies.verifyBearer).mockResolvedValueOnce(null);

    const response = await handler(new Request("https://app.qentrah.com/api/mcp", {
      method: "POST",
      headers: { cookie: "better-auth.session_token=session" },
      body: "{}",
    }));

    expect(response.status).toBe(401);
    expect(response.headers.get("www-authenticate")).toContain(
      "https://app.qentrah.com/.well-known/oauth-protected-resource/api/mcp",
    );
    expect(dependencies.verifyBearer).toHaveBeenCalledWith(null);
    await expect(response.json()).resolves.toEqual({ error: "invalid_token", requestId: "request_1" });
  });

  it("answers CORS preflight without authentication", async () => {
    const { dependencies, handler } = setup();
    const response = await handler(new Request("https://app.qentrah.com/api/mcp", {
      method: "OPTIONS",
      headers: { origin: "https://app.qentrah.com" },
    }));

    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe("https://app.qentrah.com");
    expect(response.headers.get("access-control-allow-methods")).toContain("POST");
    expect(dependencies.verifyBearer).not.toHaveBeenCalled();
  });

  it("resolves the live grant before delegating the protocol request", async () => {
    const { dependencies, executor, handler } = setup();
    const response = await handler(new Request("https://app.qentrah.com/api/mcp", {
      method: "POST",
      headers: { authorization: "Bearer access-token", "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
    }));

    expect(response.status).toBe(200);
    expect(dependencies.createExecutor).toHaveBeenCalledWith(identity);
    expect(executor.authorizeGrant).toHaveBeenCalledOnce();
    expect(dependencies.handleProtocol).toHaveBeenCalledWith(expect.any(Request), grant, executor);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-request-id")).toBe("request_1");
  });

  it("rejects oversized input before protocol parsing", async () => {
    const { dependencies, executor, handler } = setup();
    const response = await handler(new Request("https://app.qentrah.com/api/mcp", {
      method: "POST",
      headers: { authorization: "Bearer access-token", "content-length": "1000001" },
      body: "{}",
    }));

    expect(response.status).toBe(413);
    expect(executor.authorizeGrant).not.toHaveBeenCalled();
    expect(dependencies.handleProtocol).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({ error: "request_too_large" });
  });

  it("returns a retryable response when the grant rate limit is reached", async () => {
    const { executor, handler } = setup();
    vi.mocked(executor.authorizeGrant).mockRejectedValueOnce(new Error("MCP_RATE_LIMITED"));

    const response = await handler(new Request("https://app.qentrah.com/api/mcp", {
      method: "GET",
      headers: { authorization: "Bearer access-token" },
    }));

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("60");
    await expect(response.json()).resolves.toMatchObject({ error: "rate_limited" });
  });

  it("does not expose grant-resolution failures", async () => {
    const { executor, handler } = setup();
    vi.mocked(executor.authorizeGrant).mockRejectedValueOnce(new Error("grant record secret"));

    const response = await handler(new Request("https://app.qentrah.com/api/mcp", {
      method: "GET",
      headers: { authorization: "Bearer access-token" },
    }));

    expect(response.status).toBe(403);
    expect(await response.text()).not.toContain("grant record secret");
  });

  it("returns a safe protocol error without exposing implementation details", async () => {
    const { dependencies, handler } = setup();
    vi.mocked(dependencies.handleProtocol).mockRejectedValueOnce(new Error("transport secret"));

    const response = await handler(new Request("https://app.qentrah.com/api/mcp", {
      method: "GET",
      headers: { authorization: "Bearer access-token" },
    }));

    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain("transport secret");
  });
});
