import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(__dirname, "read.ts"), "utf8");

describe("Project–Space read access wiring", () => {
  it("routes every relation read through the record-aware access Module", () => {
    expect(source).toContain("resolveProjectSpaceAccess");
    expect(source.match(/filterReadableLinks/g)).toHaveLength(3);
    expect(source).toContain("assertCanReadLink");
  });

  it("does not fall back to generic Organization Project permission checks", () => {
    expect(source).not.toContain("assertOrganizationResourcePermission");
  });
});
