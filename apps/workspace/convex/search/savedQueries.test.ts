import { describe, expect, it } from "vitest";
import { normalizeSearchConfiguration, searchConfigurationFilterCount, searchConfigurationFingerprint } from "./savedQueries";

describe("saved search configuration", () => {
  it("normalizes duplicate filters into a stable user-scoped fingerprint", () => {
    const normalized = normalizeSearchConfiguration({
      tagIds: [" urgent ", "urgent"],
      search: "  إطلاق الحملة  ",
      resourceTypes: ["task", "task"],
      locales: ["ar", "en", "ar"],
    });
    expect(normalized).toMatchObject({ search: "إطلاق الحملة", resourceTypes: ["task"], tagIds: ["urgent"], locales: ["ar", "en"] });
    expect(searchConfigurationFilterCount(normalized)).toBe(3);
    expect(searchConfigurationFingerprint(normalized)).toBe(searchConfigurationFingerprint(normalizeSearchConfiguration({
      search: "إطلاق الحملة",
      resourceTypes: ["task"],
      locales: ["ar", "en"],
      tagIds: ["urgent"],
    })));
  });
  it("rejects inverted date ranges", () => {
    expect(() => normalizeSearchConfiguration({ search: "invoice", dateFrom: 20, dateTo: 10 })).toThrow("start date");
  });
});
