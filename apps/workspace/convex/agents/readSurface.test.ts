import { describe, expect, it, vi } from "vitest";
import {
  boundedAgentReadLimit,
  chronologicalAgentMessages,
  presentAgentMessage,
  presentAgentRecord,
  presentAgentThreadPage,
} from "./readSurface";

describe("Agent Convex read surface", () => {
  it("bounds agent read limits with per-query fallbacks and caps", () => {
    expect(boundedAgentReadLimit(undefined, 20, 50)).toBe(20);
    expect(boundedAgentReadLimit(0, 20, 50)).toBe(1);
    expect(boundedAgentReadLimit(80, 20, 50)).toBe(50);
  });

  it("presents records and thread pages with stable id aliases", () => {
    expect(presentAgentRecord({ _id: "thread_1", title: "Inbox" })).toEqual({
      _id: "thread_1",
      id: "thread_1",
      title: "Inbox",
    });
    expect(presentAgentThreadPage({
      page: [{ _id: "thread_1" }],
      isDone: false,
      continueCursor: "cursor",
    })).toEqual({
      threads: [{ _id: "thread_1", id: "thread_1" }],
      isDone: false,
      continueCursor: "cursor",
    });
  });

  it("reveals messages while hiding encrypted storage fields", async () => {
    const reveal = vi.fn(async () => "revealed");
    await expect(presentAgentMessage({
      _id: "message_1",
      organizationId: "org_1",
      content: "[redacted]",
      encryptedContent: "ciphertext",
      contentRedacted: true,
    }, reveal)).resolves.toEqual({
      _id: "message_1",
      organizationId: "org_1",
      id: "message_1",
      content: "revealed",
    });
    expect(reveal).toHaveBeenCalledWith("org_1", "agent-message", "ciphertext", "[redacted]");
  });

  it("keeps newest-first query results in chronological display order", () => {
    expect(chronologicalAgentMessages(["newest", "older"])).toEqual(["older", "newest"]);
  });
});
