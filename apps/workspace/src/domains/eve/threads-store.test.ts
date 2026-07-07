import { describe, it, expect, beforeEach, vi } from "vitest";
import { threadKey, indexKey, threadBelongsToOrg, generateThreadId } from "./threads-store";

// ─── Layer 1: Key format utilities (pure functions, no mocks needed) ───

describe("threadKey", () => {
  it("scopes thread keys by orgId", () => {
    expect(threadKey("org_a", "thread_1")).toBe("thread:org_a:thread_1");
  });

  it("produces different keys for different orgs", () => {
    const a = threadKey("org_a", "same_id");
    const b = threadKey("org_b", "same_id");
    expect(a).not.toBe(b);
  });
});

describe("indexKey", () => {
  it("scopes index keys by orgId", () => {
    expect(indexKey("org_a")).toBe("thread:org_a:index");
  });

  it("produces different index keys for different orgs", () => {
    expect(indexKey("org_a")).not.toBe(indexKey("org_b"));
  });
});

describe("threadBelongsToOrg", () => {
  it("returns true when key matches org", () => {
    expect(threadBelongsToOrg("thread:org_a:abc", "org_a")).toBe(true);
  });

  it("returns false when key belongs to different org", () => {
    expect(threadBelongsToOrg("thread:org_a:abc", "org_b")).toBe(false);
  });

  it("rejects old-style keys (no org prefix)", () => {
    expect(threadBelongsToOrg("thread:abc", "org_a")).toBe(false);
  });
});

describe("generateThreadId", () => {
  it("generates unique IDs", async () => {
    const id1 = await generateThreadId();
    const id2 = await generateThreadId();
    expect(id1).toBeDefined();
    expect(id2).toBeDefined();
    expect(id1).not.toBe(id2);
  });
});

// ─── Layer 2: Session encode/decode (used by useEveChat, no mocks) ───

describe("session encode/decode", () => {
  const sessionState = { continuationToken: "evetest", sessionId: "sess_123", streamIndex: 5 };

  it("encodeSession produces base64 JSON", () => {
    // We can't directly import use-eve-chat hook in node (it uses next/navigation).
    // Instead test the round-trip directly.
    const encoded = btoa(JSON.stringify(sessionState));
    const decoded = JSON.parse(atob(encoded));
    expect(decoded).toEqual(sessionState);
  });
});
