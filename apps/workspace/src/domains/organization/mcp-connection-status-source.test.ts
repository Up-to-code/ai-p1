import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");

function readSource(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("MCP connection status validators", () => {
  it("keeps the table schema and return validator aligned for draft connections", () => {
    const schema = readSource("convex/schema.ts");
    const validators = readSource("convex/mcp/validators.ts");

    expect(schema).toContain('status: v.union(v.literal("active"), v.literal("paused"), v.literal("draft"), v.literal("revoked"))');
    expect(validators).toContain('status: v.union(v.literal("active"), v.literal("paused"), v.literal("draft"), v.literal("revoked"))');
    expect(validators).toContain('status: v.optional(v.union(v.literal("active"), v.literal("paused"), v.literal("draft")))');
  });
});
