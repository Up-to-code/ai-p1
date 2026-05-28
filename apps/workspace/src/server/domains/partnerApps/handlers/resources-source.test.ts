import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./resources.ts", import.meta.url), "utf8");

describe("partner resource handlers source", () => {
  it("depends on the deep partner resource access seam", () => {
    expect(source).toContain("../services/partner-resource-access");
    expect(source).not.toContain("../services/access-token");
    expect(source).not.toContain("../services/organization-api-key-access");
    expect(source).not.toContain("isOrganizationApiKeyToken");
    expect(source).not.toContain("readOrganizationApiKeyResource");
    expect(source).not.toContain("writeOrganizationApiKeyResource");
  });
});
