import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function readSource(path: string) {
  return readFileSync(path, "utf8");
}

describe("agent confirmation service source guards", () => {
  it("replays approved external MCP confirmations instead of stopping at approval-only", () => {
    const source = readSource("src/server/domains/agents/services/confirmations.ts");

    expect(source).toContain('approved.confirmation.adapter === "mcp"');
    expect(source).toContain("executeConfirmedMcpTool");
    expect(source).toContain("markExecutedFromHono");
    expect(source).not.toContain("External MCP execution is intentionally not replayed");
    expect(source).not.toContain("approvalOnly: true");
  });
});
