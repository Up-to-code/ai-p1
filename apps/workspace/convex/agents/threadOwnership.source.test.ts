import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = new URL("../", import.meta.url);

function source(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

describe("agent thread ownership source guards", () => {
  it("indexes and lists agent threads by organization and creator", () => {
    expect(source("schema.ts")).toContain(
      '.index("by_organization_creator_updated", ["organizationId", "createdByUserId", "updatedAt"])',
    );
    expect(source("agents/read.ts")).toContain('withIndex("by_organization_creator_updated"');
    expect(source("agents/read.ts")).toContain('.eq("createdByUserId", userId)');
  });

  it("guards message/context reads and chat continuation by thread creator", () => {
    expect(source("agents/read.ts")).toContain("isOwnedThread(thread, args.organizationId, userId)");
    expect(source("agents/write.ts")).toContain("assertOwnedThread(existing, args.organizationId, userId)");
  });

  it("hard-deletes all agent records owned by a deleted thread", () => {
    const writeSource = source("agents/write.ts");

    for (const tableName of [
      "agentMessages",
      "agentRuns",
      "agentRunSteps",
      "agentToolCalls",
      "agentMemorySummaries",
      "agentMemoryFacts",
      "agentConfirmations",
    ]) {
      expect(writeSource).toContain(`"${tableName}"`);
    }
    expect(writeSource).toContain('q.field("status"), "running"');
    expect(writeSource).toContain("await ctx.db.delete(args.threadId)");
  });
});
