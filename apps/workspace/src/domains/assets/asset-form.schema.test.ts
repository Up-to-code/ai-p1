import { describe, expect, it } from "vitest";
import { assetSchema } from "./validation/asset.schema";

const validAssetForm = {
  title: "Test asset",
  projectId: "",
  project: "",
  city: "Remote",
  type: "Document",
  status: "draft",
  visibility: "private",
  purpose: "sale",
  price: "100",
  area: "Shared",
  bedrooms: "0",
  bathrooms: "0",
  description: "test",
};

describe("asset form schema", () => {
  it("accepts short draft descriptions before starting the save operation", () => {
    expect(assetSchema.safeParse(validAssetForm).success).toBe(true);
  });

  it("still rejects blank descriptions", () => {
    const result = assetSchema.safeParse({ ...validAssetForm, description: "   " });

    expect(result.success).toBe(false);
  });
});
