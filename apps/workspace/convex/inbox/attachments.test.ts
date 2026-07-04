import { describe, it, expect } from "vitest";
import { messageInputValidator, messageValidator } from "./validators";

describe("Inbox Attachment System", () => {
  describe("Attachment Structure Validation", () => {
    it("should accept message with single attachment", () => {
      const message = {
        _id: "msg_123" as any,
        _creationTime: Date.now(),
        id: "msg_123",
        channelId: "channel_456",
        content: "File attached",
        authorId: "author_789",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        attachments: [
          {
            id: "att_123",
            name: "document.pdf",
            url: "https://example.com/files/document.pdf",
            type: "application/pdf",
            size: 1024000,
          },
        ],
      };

      expect(() => messageValidator.parse(message)).not.toThrow();
    });

    it("should accept message with multiple attachments", () => {
      const message = {
        _id: "msg_123" as any,
        _creationTime: Date.now(),
        id: "msg_123",
        channelId: "channel_456",
        content: "Multiple files attached",
        authorId: "author_789",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        attachments: [
          {
            id: "att_1",
            name: "document.pdf",
            url: "https://example.com/files/doc.pdf",
            type: "application/pdf",
            size: 1024000,
          },
          {
            id: "att_2",
            name: "image.png",
            url: "https://example.com/files/img.png",
            type: "image/png",
            size: 512000,
          },
          {
            id: "att_3",
            name: "data.xlsx",
            url: "https://example.com/files/data.xlsx",
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            size: 256000,
          },
        ],
      };

      expect(() => messageValidator.parse(message)).not.toThrow();
    });

    it("should accept message without attachments", () => {
      const message = {
        _id: "msg_123" as any,
        _creationTime: Date.now(),
        id: "msg_123",
        channelId: "channel_456",
        content: "No attachments",
        authorId: "author_789",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      expect(() => messageValidator.parse(message)).not.toThrow();
    });

    it("should accept message with empty attachments array", () => {
      const message = {
        _id: "msg_123" as any,
        _creationTime: Date.now(),
        id: "msg_123",
        channelId: "channel_456",
        content: "Empty attachments",
        authorId: "author_789",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        attachments: [],
      };

      expect(() => messageValidator.parse(message)).not.toThrow();
    });
  });

  describe("Attachment File Types", () => {
    const createMessageWithAttachment = (type: string, name: string) => ({
      _id: "msg_123" as any,
      _creationTime: Date.now(),
      id: "msg_123",
      channelId: "channel_456",
      content: "File attached",
      authorId: "author_789",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      attachments: [
        {
          id: "att_123",
          name,
          url: `https://example.com/files/${name}`,
          type,
          size: 1024000,
        },
      ],
    });

    it("should accept PDF attachments", () => {
      const message = createMessageWithAttachment("application/pdf", "document.pdf");
      expect(() => messageValidator.parse(message)).not.toThrow();
    });

    it("should accept image attachments", () => {
      const imageTypes = [
        { type: "image/jpeg", name: "photo.jpg" },
        { type: "image/png", name: "screenshot.png" },
        { type: "image/gif", name: "animation.gif" },
        { type: "image/webp", name: "modern.webp" },
      ];

      imageTypes.forEach(({ type, name }) => {
        const message = createMessageWithAttachment(type, name);
        expect(() => messageValidator.parse(message)).not.toThrow();
      });
    });

    it("should accept document attachments", () => {
      const docTypes = [
        { type: "application/msword", name: "document.doc" },
        {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          name: "document.docx",
        },
        { type: "application/vnd.ms-excel", name: "spreadsheet.xls" },
        {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          name: "spreadsheet.xlsx",
        },
        { type: "text/plain", name: "notes.txt" },
        { type: "text/csv", name: "data.csv" },
      ];

      docTypes.forEach(({ type, name }) => {
        const message = createMessageWithAttachment(type, name);
        expect(() => messageValidator.parse(message)).not.toThrow();
      });
    });

    it("should accept video attachments", () => {
      const videoTypes = [
        { type: "video/mp4", name: "video.mp4" },
        { type: "video/webm", name: "recording.webm" },
        { type: "video/quicktime", name: "movie.mov" },
      ];

      videoTypes.forEach(({ type, name }) => {
        const message = createMessageWithAttachment(type, name);
        expect(() => messageValidator.parse(message)).not.toThrow();
      });
    });

    it("should accept audio attachments", () => {
      const audioTypes = [
        { type: "audio/mpeg", name: "audio.mp3" },
        { type: "audio/wav", name: "recording.wav" },
        { type: "audio/ogg", name: "voice.ogg" },
      ];

      audioTypes.forEach(({ type, name }) => {
        const message = createMessageWithAttachment(type, name);
        expect(() => messageValidator.parse(message)).not.toThrow();
      });
    });
  });

  describe("Attachment Size Validation", () => {
    it("should accept attachments of various sizes", () => {
      const sizes = [
        1024, // 1 KB
        1024 * 1024, // 1 MB
        10 * 1024 * 1024, // 10 MB
        100 * 1024 * 1024, // 100 MB
      ];

      sizes.forEach((size) => {
        const message = {
          _id: "msg_123" as any,
          _creationTime: Date.now(),
          id: "msg_123",
          channelId: "channel_456",
          content: "File attached",
          authorId: "author_789",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          attachments: [
            {
              id: "att_123",
              name: "file.dat",
              url: "https://example.com/files/file.dat",
              type: "application/octet-stream",
              size,
            },
          ],
        };

        expect(() => messageValidator.parse(message)).not.toThrow();
      });
    });

    it("should accept zero-byte files", () => {
      const message = {
        _id: "msg_123" as any,
        _creationTime: Date.now(),
        id: "msg_123",
        channelId: "channel_456",
        content: "Empty file",
        authorId: "author_789",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        attachments: [
          {
            id: "att_123",
            name: "empty.txt",
            url: "https://example.com/files/empty.txt",
            type: "text/plain",
            size: 0,
          },
        ],
      };

      expect(() => messageValidator.parse(message)).not.toThrow();
    });
  });

  describe("Attachments with Mentions", () => {
    it("should accept message with both attachments and mentions", () => {
      const message = {
        _id: "msg_123" as any,
        _creationTime: Date.now(),
        id: "msg_123",
        channelId: "channel_456",
        content: "Hey @user, check this file",
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
            url: "https://example.com/files/document.pdf",
            type: "application/pdf",
            size: 1024000,
          },
        ],
      };

      expect(() => messageValidator.parse(message)).not.toThrow();
    });

    it("should accept message with multiple attachments and mentions", () => {
      const message = {
        _id: "msg_123" as any,
        _creationTime: Date.now(),
        id: "msg_123",
        channelId: "channel_456",
        content: "@user1 and @user2, review these files for @project",
        authorId: "author_789",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        mentions: [
          {
            type: "user",
            id: "user_1",
            name: "user1",
          },
          {
            type: "user",
            id: "user_2",
            name: "user2",
          },
          {
            type: "project",
            id: "proj_123",
            name: "project",
          },
        ],
        attachments: [
          {
            id: "att_1",
            name: "report.pdf",
            url: "https://example.com/files/report.pdf",
            type: "application/pdf",
            size: 2048000,
          },
          {
            id: "att_2",
            name: "data.xlsx",
            url: "https://example.com/files/data.xlsx",
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            size: 512000,
          },
        ],
      };

      expect(() => messageValidator.parse(message)).not.toThrow();
    });
  });

  describe("Attachment URL Validation", () => {
    it("should accept various URL formats", () => {
      const urls = [
        "https://example.com/file.pdf",
        "https://cdn.example.com/files/abc123/document.pdf",
        "https://storage.example.com/bucket/folder/file.pdf",
        "https://example.com/api/files/download?id=123&token=abc",
      ];

      urls.forEach((url) => {
        const message = {
          _id: "msg_123" as any,
          _creationTime: Date.now(),
          id: "msg_123",
          channelId: "channel_456",
          content: "File attached",
          authorId: "author_789",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          attachments: [
            {
              id: "att_123",
              name: "file.pdf",
              url,
              type: "application/pdf",
              size: 1024000,
            },
          ],
        };

        expect(() => messageValidator.parse(message)).not.toThrow();
      });
    });
  });

  describe("Attachment Metadata", () => {
    it("should require all attachment fields", () => {
      const message = {
        _id: "msg_123" as any,
        _creationTime: Date.now(),
        id: "msg_123",
        channelId: "channel_456",
        content: "File attached",
        authorId: "author_789",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        attachments: [
          {
            id: "att_123",
            name: "document.pdf",
            url: "https://example.com/files/document.pdf",
            type: "application/pdf",
            size: 1024000,
          },
        ],
      };

      const parsed = messageValidator.parse(message);
      expect(parsed.attachments).toBeDefined();
      expect(parsed.attachments![0]).toHaveProperty("id");
      expect(parsed.attachments![0]).toHaveProperty("name");
      expect(parsed.attachments![0]).toHaveProperty("url");
      expect(parsed.attachments![0]).toHaveProperty("type");
      expect(parsed.attachments![0]).toHaveProperty("size");
    });
  });
});
