import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const source = readFileSync(fileURLToPath(new URL("./read.ts", import.meta.url)), "utf8");

describe("client task read.get", () => {
  it("normalizes task route IDs before fetching records", () => {
    expect(source).toContain('args: { organizationId: v.string(), taskId: v.string() }');
    expect(source).toContain('ctx.db.normalizeId("tasks", args.taskId)');
    expect(source).toContain("if (!taskId) return null;");
  });
});
