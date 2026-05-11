import { describe, expect, it } from "vitest";
import { attachMediaPayloadSchema, inferMediaKind, validateMediaKind } from "./media.schema";

describe("media validation", () => {
  it("infers media kind from MIME type", () => {
    expect(inferMediaKind("image/webp")).toBe("image");
    expect(inferMediaKind("video/mp4")).toBe("video");
    expect(inferMediaKind("application/pdf")).toBe("document");
  });

  it("rejects a mismatched submitted kind", () => {
    expect(() => validateMediaKind("image/png", "document")).toThrow(/does not match/);
  });

  it("accepts client, calendar, and task document attachments", () => {
    for (const resourceType of ["client", "calendarEvent", "task"] as const) {
      expect(() =>
        attachMediaPayloadSchema.parse({
          key: `${resourceType}/file.pdf`,
          url: "https://example.com/file.pdf",
          name: "file.pdf",
          mimeType: "application/pdf",
          size: 1024,
          kind: "document",
          resourceType,
          resourceId: "resource_123",
        }),
      ).not.toThrow();
    }
  });
});
