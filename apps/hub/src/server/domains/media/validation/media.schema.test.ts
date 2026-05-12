import { describe, expect, it } from "vitest";
import {
  attachMediaPayloadSchema,
  createMediaFolderPayloadSchema,
  updateMediaPayloadSchema,
} from "./media.schema";

describe("media schemas", () => {
  it("accepts client media uploads with an optional folder id", () => {
    const parsed = attachMediaPayloadSchema.parse({
      key: "upload-key",
      url: "https://example.com/file.pdf",
      name: "Contract.pdf",
      mimeType: "application/pdf",
      size: 1234,
      kind: "document",
      resourceType: "client",
      resourceId: "client-id",
      folderId: "folder-id",
    });

    expect(parsed.folderId).toBe("folder-id");
  });

  it("accepts public and private visibility updates", () => {
    expect(updateMediaPayloadSchema.parse({ shareVisibility: "public" }).shareVisibility).toBe("public");
    expect(updateMediaPayloadSchema.parse({ shareVisibility: "private" }).shareVisibility).toBe("private");
  });

  it("rejects unsupported visibility updates", () => {
    expect(() => updateMediaPayloadSchema.parse({ shareVisibility: "team-only" })).toThrow();
  });

  it("requires named one-level folders for client resources", () => {
    const parsed = createMediaFolderPayloadSchema.parse({
      resourceType: "client",
      resourceId: "client-id",
      name: "Contracts",
    });

    expect(parsed.name).toBe("Contracts");
  });
});
