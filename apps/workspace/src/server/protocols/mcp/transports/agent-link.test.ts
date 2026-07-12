import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { registerMcpAgentTransport } from "./agent-link";

function appForTests() {
  const app = new Hono().basePath("/api");
  registerMcpAgentTransport(app);
  return app;
}

describe("retired secret MCP transport", () => {
  for (const method of ["GET", "POST", "DELETE"]) {
    it(`returns a sanitized migration response for ${method}`, async () => {
      const response = await appForTests().request("/api/mcp/agent/public/should-never-be-read", { method });
      expect(response.status).toBe(410);
      const body = await response.text();
      expect(body).toContain("legacy_mcp_link_retired");
      expect(body).not.toContain("should-never-be-read");
    });
  }
});
