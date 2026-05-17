import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";

const liveUrl = process.env.PARTNER_MCP_TEST_URL;
const liveMutationsEnabled = process.env.PARTNER_MCP_LIVE_MUTATIONS === "1";
const describeLive = liveUrl && liveMutationsEnabled ? describe : describe.skip;

type JsonRpcResult<T> = {
  jsonrpc: "2.0";
  id: string;
  result?: T;
  error?: { code: number; message: string };
};

type ToolResult = {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
};

async function rpc<T>(method: string, params: Record<string, unknown> = {}) {
  const response = await fetch(liveUrl!, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: randomUUID(), method, params }),
  });
  const payload = await response.json() as JsonRpcResult<T>;
  if (!response.ok || payload.error) {
    throw new Error(payload.error?.message ?? `MCP ${method} failed with ${response.status}`);
  }
  return payload.result as T;
}

async function callTool(name: string, args: Record<string, unknown> = {}) {
  const result = await rpc<ToolResult>("tools/call", { name, arguments: args });
  const text = result.content[0]?.text ?? "{}";
  return JSON.parse(text) as Record<string, unknown>;
}

describeLive("Partner MCP live authorization lifecycle", () => {
  it("initializes, reads lifecycle context, mutates a disposable app, reads sandbox status, and cleans up", async () => {
    let disposableAppId: string | undefined;
    const suffix = randomUUID().slice(0, 8);
    const disposableName = `Codex Disposable MCP ${suffix}`;

    try {
      const initialized = await rpc<Record<string, unknown>>("initialize", {});
      expect(initialized.serverInfo).toMatchObject({ name: "qentrah-partners-mcp" });

      const tools = await rpc<{ tools: Array<{ name: string }> }>("tools/list", {});
      expect(tools.tools.map((tool) => tool.name)).toContain("partner_authorization_flow");

      const guidance = await callTool("partner_operator_guidance");
      expect(JSON.stringify(guidance)).toContain("OAuth 2.1 authorization lifecycle");

      const flow = await callTool("partner_authorization_flow");
      expect(flow.docsPath).toBe("/docs/authorization-lifecycle");
      expect(JSON.stringify(flow)).not.toMatch(/mcp_secret|clientSecret/i);

      const appList = await callTool("partner_apps_list");
      expect(appList).toHaveProperty("apps");

      const created = await callTool("partner_apps_create", {
        name: disposableName,
        publisherName: "Codex MCP Live Test",
        homepageUrl: "https://example.com",
        clientType: "public",
        redirectUris: [`https://example.com/oauth/${suffix}/callback`],
        allowedScopes: ["organization:read", "client:read", "client:create", "client:update"],
      });
      disposableAppId = String(created.appId);
      expect(String(created.clientId)).toContain("partners_client");
      expect(JSON.stringify(created)).not.toMatch(/secret/i);

      const fetched = await callTool("partner_apps_get", { appId: disposableAppId });
      expect(JSON.stringify(fetched)).toContain(disposableName);

      await callTool("partner_apps_update", {
        appId: disposableAppId,
        name: `${disposableName} Updated`,
        publisherName: "Codex MCP Live Test",
        homepageUrl: "https://example.com",
        redirectUris: [`https://example.com/oauth/${suffix}/callback`],
        allowedScopes: ["organization:read", "client:read", "client:create", "client:update"],
      });

      const sandboxStatus = await callTool("partner_sandbox_status", { appId: disposableAppId });
      expect(sandboxStatus).toHaveProperty("sandbox");
      expect(sandboxStatus).toHaveProperty("logs");

      await callTool("partner_apps_submit_for_review", { appId: disposableAppId });
    } finally {
      if (disposableAppId) {
        await callTool("partner_apps_delete", { appId: disposableAppId }).catch(() => null);
      }
    }
  }, 90_000);
});
