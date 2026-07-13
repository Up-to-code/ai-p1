import { describe, expect, it } from "vitest";
import {
  enforceMcpRequestSize,
  McpRequestPolicyError,
  withMcpDeadline,
} from "./request-policy";

describe("MCP request policy", () => {
  it("enforces the body limit even without a content-length header", async () => {
    const request = new Request("https://app.qentrah.com/api/mcp", {
      method: "POST",
      body: "payload",
    });

    await expect(enforceMcpRequestSize(request, 3)).rejects.toMatchObject({
      code: "request_too_large",
      status: 413,
    });
  });

  it("returns a stable timeout error when an operation exceeds its deadline", async () => {
    const pending = new Promise<never>(() => undefined);
    await expect(withMcpDeadline(pending, 1)).rejects.toEqual(
      new McpRequestPolicyError("request_timeout", 504),
    );
  });
});
