import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn() },
}));

import {
  canInsertDurableMedia,
  isTemporaryObjectUrl,
  uploadDurableMediaFile,
} from "./yoopta-rich-text-editor";

describe("canInsertDurableMedia", () => {
  const upload = async () => "https://cdn.example.test/uploaded.png";

  it("only enables media plugins with a durable upload adapter", () => {
    expect(canInsertDurableMedia(undefined, false)).toBe(false);
    expect(canInsertDurableMedia(upload, true)).toBe(false);
    expect(canInsertDurableMedia(upload, false)).toBe(true);
  });
});

describe("uploadDurableMediaFile", () => {
  const file = {} as File;

  it("aborts media insertion without a durable upload adapter", async () => {
    await expect(uploadDurableMediaFile(file, undefined, "editor.media_upload_failed")).rejects.toThrow(
      "Media upload did not produce a durable URL.",
    );
  });

  it("keeps durable upload URLs", async () => {
    await expect(
      uploadDurableMediaFile(file, async () => "https://cdn.example.test/uploaded.png", "editor.media_upload_failed"),
    ).resolves.toBe("https://cdn.example.test/uploaded.png");
  });

  it("aborts empty upload results", async () => {
    await expect(
      uploadDurableMediaFile(file, async () => undefined, "editor.media_upload_failed"),
    ).rejects.toThrow("Media upload did not produce a durable URL.");
  });

  it("aborts rejected uploads", async () => {
    await expect(
      uploadDurableMediaFile(file, async () => {
        throw new Error("storage unavailable");
      }, "editor.media_upload_failed"),
    ).rejects.toThrow("Media upload did not produce a durable URL.");
  });

  it("aborts and revokes temporary object URLs", async () => {
    const revokeObjectURL = vi.spyOn(globalThis.URL, "revokeObjectURL").mockImplementation(() => undefined);

    await expect(
      uploadDurableMediaFile(file, async () => "blob:temporary-upload", "editor.media_upload_failed"),
    ).rejects.toThrow("Media upload did not produce a durable URL.");

    expect(revokeObjectURL).toHaveBeenCalledWith("blob:temporary-upload");
    revokeObjectURL.mockRestore();
  });
});

describe("isTemporaryObjectUrl", () => {
  it("identifies object URLs that must not enter persisted HTML", () => {
    expect(isTemporaryObjectUrl("blob:temporary-upload")).toBe(true);
    expect(isTemporaryObjectUrl("https://cdn.example.test/uploaded.png")).toBe(false);
  });
});
