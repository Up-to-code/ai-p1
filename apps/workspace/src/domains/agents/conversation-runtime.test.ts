import { describe, expect, it } from "vitest";
import { visibleAgentConversationMessages } from "./conversation-runtime";

describe("agent conversation runtime", () => {
  it("keeps transient message ids when persisted messages match after streaming", () => {
    const messages = visibleAgentConversationMessages({
      organizationId: "org_1",
      activeThreadId: "thread_1",
      isSending: false,
      transientConversation: {
        organizationId: "org_1",
        threadId: "thread_1",
        messages: [
          { id: "local-user", role: "user", content: "hi" },
          { id: "local-assistant", role: "assistant", content: "Hello." },
        ],
      },
      persistedMessages: [
        { id: "persisted-user", role: "user", content: "hi", createdAt: 1 },
        { id: "persisted-assistant", role: "assistant", content: "Hello.", createdAt: 2 },
      ],
    });

    expect(messages).toEqual([
      { id: "local-user", role: "user", content: "hi", agUiTurn: undefined },
      { id: "local-assistant", role: "assistant", content: "Hello.", agUiTurn: undefined },
    ]);
  });

  it("keeps transient content visible until persisted content catches up", () => {
    const messages = visibleAgentConversationMessages({
      organizationId: "org_1",
      activeThreadId: "thread_1",
      isSending: false,
      transientConversation: {
        organizationId: "org_1",
        threadId: "thread_1",
        messages: [
          { id: "local-user", role: "user", content: "hi" },
          { id: "local-assistant", role: "assistant", content: "Hello there." },
        ],
      },
      persistedMessages: [
        { id: "persisted-user", role: "user", content: "hi", createdAt: 1 },
        { id: "persisted-assistant", role: "assistant", content: "Hello.", createdAt: 2 },
      ],
    });

    expect(messages.at(-1)?.id).toBe("local-assistant");
    expect(messages.at(-1)?.content).toBe("Hello there.");
  });
});
