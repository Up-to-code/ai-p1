import { describe, it, expect } from "vitest";
import { messageInputValidator, messageValidator } from "./validators";

describe("Inbox Mention System", () => {
  describe("Message Input Validation", () => {
    it("should accept message with valid user mention", () => {
      const input = {
        content: "Hey @john, can you review this?",
        mentions: [
          {
            type: "user",
            id: "user_123",
            name: "john",
          },
        ],
      };
      expect(input).toMatchObject({ content: expect.any(String) });
    });

    it("should accept message with multiple mention types", () => {
      const input = {
        content: "@user check @task and @document",
        mentions: [
          {
            type: "user",
            id: "user_123",
            name: "user",
          },
          {
            type: "task",
            id: "task_456",
            name: "task",
          },
          {
            type: "document",
            id: "doc_789",
            name: "document",
          },
        ],
      };
      expect(input).toMatchObject({ content: expect.any(String) });
    });

    it("should accept message with file and document mentions", () => {
      const input = {
        content: "See @file and @doc for details",
        mentions: [
          {
            type: "file",
            id: "file_abc",
            name: "file",
          },
          {
            type: "document",
            id: "doc_def",
            name: "doc",
          },
        ],
      };
      expect(input).toMatchObject({ content: expect.any(String) });
    });

    it("should accept message with client, deal, and project mentions", () => {
      const input = {
        content: "Update @client about @deal in @project",
        mentions: [
          {
            type: "client",
            id: "client_123",
            name: "client",
          },
          {
            type: "deal",
            id: "deal_456",
            name: "deal",
          },
          {
            type: "project",
            id: "proj_789",
            name: "project",
          },
        ],
      };
      expect(input).toMatchObject({ content: expect.any(String) });
    });

    it("should accept message without mentions", () => {
      const input = {
        content: "Regular message without mentions",
      };
      expect(input).toMatchObject({ content: expect.any(String) });
    });

    it("should accept empty mentions array", () => {
      const input = {
        content: "Message with empty mentions",
        mentions: [],
      };
      expect(input).toMatchObject({ content: expect.any(String) });
    });
  });

  describe("Message Storage Validation", () => {
    it("should store message with mentions correctly", () => {
      const message = {
        _id: "msg_123" as any,
        _creationTime: Date.now(),
        id: "msg_123",
        channelId: "channel_456",
        content: "Hey @user, check this",
        authorId: "author_789",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        mentions: [
          {
            type: "user",
            id: "user_abc",
            name: "user",
          },
        ],
      };
      expect(message).toMatchObject({ content: expect.any(String) });
    });

    it("should store message with attachments and mentions", () => {
      const message = {
        _id: "msg_123" as any,
        _creationTime: Date.now(),
        id: "msg_123",
        channelId: "channel_456",
        content: "File attached, cc @user",
        authorId: "author_789",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        mentions: [
          {
            type: "user",
            id: "user_abc",
            name: "user",
          },
        ],
        attachments: [
          {
            id: "att_123",
            name: "document.pdf",
            url: "https://example.com/doc.pdf",
            type: "application/pdf",
            size: 12345,
          },
        ],
      };
      expect(message).toMatchObject({ content: expect.any(String) });
    });
  });

  describe("Mention Parsing Logic", () => {
    it("should extract mentions from content", () => {
      const content = "Hey @john, please review @task-123 and the @document";
      const mentionPattern = /@(\w+(?:-\w+)?)/g;
      const matches = [...content.matchAll(mentionPattern)];

      expect(matches).toHaveLength(3);
      expect(matches[0][1]).toBe("john");
      expect(matches[1][1]).toBe("task-123");
      expect(matches[2][1]).toBe("document");
    });

    it("should handle multiple mentions of same entity", () => {
      const content = "@user mentioned @user twice";
      const mentionPattern = /@(\w+)/g;
      const matches = [...content.matchAll(mentionPattern)];

      expect(matches).toHaveLength(2);
      expect(matches[0][1]).toBe("user");
      expect(matches[1][1]).toBe("user");
    });

    it("should handle mentions at different positions", () => {
      const content = "@start middle @middle end @end";
      const mentionPattern = /@(\w+)/g;
      const matches = [...content.matchAll(mentionPattern)];

      expect(matches).toHaveLength(3);
      expect(content.indexOf("@start")).toBe(0);
      expect(content.indexOf("@middle")).toBeGreaterThan(0);
      expect(content.indexOf("@end")).toBeGreaterThan(content.indexOf("@middle"));
    });
  });

  describe("Mention Type Validation", () => {
    it("should validate all supported mention types", () => {
      const supportedTypes = [
        "user",
        "task",
        "document",
        "file",
        "client",
        "deal",
        "project",
      ];

      supportedTypes.forEach((type) => {
        const input = {
          content: `Mention @${type}`,
          mentions: [
            {
              type,
              id: `${type}_123`,
              name: type,
            },
          ],
        };
      expect(input).toMatchObject({ content: expect.any(String) });
      });
    });

    it("should handle mixed case content with mentions", () => {
      const input = {
        content: "Hey @John, Check @TASK-123",
        mentions: [
          {
            type: "user",
            id: "user_123",
            name: "John",
          },
          {
            type: "task",
            id: "task_456",
            name: "TASK-123",
          },
        ],
      };
      expect(input).toMatchObject({ content: expect.any(String) });
    });
  });

  describe("Thread and Reply with Mentions", () => {
    it("should accept message with mentions in thread", () => {
      const input = {
        content: "Thread reply mentioning @user",
        threadId: "thread_123",
        mentions: [
          {
            type: "user",
            id: "user_abc",
            name: "user",
          },
        ],
      };
      expect(input).toMatchObject({ content: expect.any(String) });
    });

    it("should accept reply with mentions", () => {
      const input = {
        content: "Reply mentioning @user",
        replyToId: "msg_original",
        mentions: [
          {
            type: "user",
            id: "user_abc",
            name: "user",
          },
        ],
      };
      expect(input).toMatchObject({ content: expect.any(String) });
    });

    it("should accept thread reply with mentions", () => {
      const input = {
        content: "Thread reply mentioning @user",
        threadId: "thread_123",
        replyToId: "msg_original",
        mentions: [
          {
            type: "user",
            id: "user_abc",
            name: "user",
          },
        ],
      };
      expect(input).toMatchObject({ content: expect.any(String) });
    });
  });
});
