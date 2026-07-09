import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(__dirname, "write.ts"), "utf8");

describe("Inbox write authorization guards", () => {
  it("does not expose internal writes that trust caller-supplied actor IDs", () => {
    expect(source).not.toContain("internalMutation");
    expect(source).not.toMatch(/actorUserId:\s*v\.string\(\)/);
    expect(source).not.toMatch(/authorId:\s*v\.string\(\)/);
  });

  it("resolves Channel access before every public write family", () => {
    expect(source).toContain("resolveChannelAccess(ctx, args.organizationId)");
    expect(
      source.match(/requireChannelAccess\(/g)?.length ?? 0,
    ).toBeGreaterThanOrEqual(10);
    expect(source).toContain('"post"');
    expect(source).toContain('"update"');
    expect(source).toContain('"delete"');
  });

  it("uses compound Channel ownership checks for messages, replies, threads, and pins", () => {
    expect(source).toContain("findMessageInChannel");
    expect(source).toContain("findThreadInChannel");
    expect(source).toContain("REPLY_THREAD_MISMATCH");
    expect(source).toContain("THREAD_ALREADY_EXISTS");
    expect(source).not.toContain('.query("messages").collect()');
    expect(source).not.toContain('.query("channels").collect()');
    expect(source).not.toContain('.query("threads").collect()');
  });
});
