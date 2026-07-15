import { describe, expect, it } from "vitest";
import type { SearchProjection } from "@qentrah/domain-contracts";
import { searchIndexName, shouldExternallyIndex } from "./indexPolicy";

const projection = { resourceType: "task", sensitivity: "standard" } as SearchProjection;

describe("external search indexing policy", () => {
  it("indexes standard records by default and never indexes tombstones", () => {
    expect(shouldExternallyIndex(projection, null)).toBe(true);
    expect(shouldExternallyIndex({ ...projection, deletedAt: 1 }, null)).toBe(false);
  });
  it("requires explicit policy for restricted and confidential records", () => {
    expect(shouldExternallyIndex({ ...projection, sensitivity: "restricted" }, null)).toBe(false);
    expect(shouldExternallyIndex({ ...projection, sensitivity: "confidential" }, null)).toBe(false);
  });
  it("creates stable locale-specific index names", () => {
    expect(searchIndexName("qentrah", "AR-EG")).toBe("qentrah_ar-eg");
  });
});
