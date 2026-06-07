import { describe, expect, it } from "vitest";
import { assetPayloadSchema } from "./validation/asset.schema";

const validAssetPayload = {
  name: "Test asset",
  type: "document",
  status: "draft",
  visibility: "private",
  description: "test",
};

describe("asset payload schema", () => {
  it("accepts short draft descriptions so rough asset inputs can be saved", () => {
    expect(assetPayloadSchema.safeParse(validAssetPayload).success).toBe(true);
  });

  it("normalizes blank optional descriptions", () => {
    const result = assetPayloadSchema.safeParse({ ...validAssetPayload, description: "   " });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeUndefined();
    }
  });

  it("accepts file metadata from the workspace packet", () => {
    const result = assetPayloadSchema.safeParse({
      ...validAssetPayload,
      fileId: "file_123",
      tags: ["brief"],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fileId).toBe("file_123");
      expect(result.data.tags).toEqual(["brief"]);
    }
  });

  it("accepts workspace asset availability statuses from the asset form", () => {
    const result = assetPayloadSchema.safeParse({
      ...validAssetPayload,
      status: "available",
    });

    expect(result.success).toBe(true);
  });
});
