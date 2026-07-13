import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const mcpRoot = resolve(__dirname);

describe("MCP scoped execution seam", () => {
  it("passes scope beside public input instead of hiding it inside input", () => {
    const executionSource = readFileSync(
      resolve(mcpRoot, "toolsOAuth.ts"),
      "utf8",
    );
    const policySource = readFileSync(
      resolve(mcpRoot, "scopePolicy.ts"),
      "utf8",
    );

    expect(executionSource).toContain("scopePolicy: scopePolicyContext(resolved.policy)");
    expect(executionSource).toContain("input: inputObject(args.input)");
    expect(executionSource).not.toContain("attachScopePolicyInput");
    expect(policySource).not.toContain("__qentrahMcpScopePolicy");
  });

  it("does not make domain handlers recover policy from tool input", () => {
    for (const file of [
      "calendar.ts",
      "clients.ts",
      "deals.ts",
      "media.ts",
      "notifications.ts",
      "projects.ts",
      "spaces.ts",
      "tasks.ts",
    ]) {
      const source = readFileSync(resolve(mcpRoot, "handlers", file), "utf8");
      expect(source, file).not.toContain("scopePolicyFromInput");
      expect(source, file).not.toContain("scopeActorUserId(args.input)");
    }
  });
});
