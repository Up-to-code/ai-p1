import { describe, expect, it } from "vitest";
import { presentWorkspaceRecord, stripDeletedFields } from "./present";

describe("presentWorkspaceRecord", () => {
  it("adds id field mirroring _id", () => {
    const result = presentWorkspaceRecord({ _id: "abc123", name: "test" });
    expect(result).toEqual({ _id: "abc123", id: "abc123", name: "test" });
  });

  it("overrides existing id field with _id", () => {
    const result = presentWorkspaceRecord({ _id: "abc123", id: "custom-id", name: "test" });
    expect(result.id).toBe("abc123");
  });
});

describe("stripDeletedFields", () => {
  it("removes deletedAt and isDeleted from records", () => {
    const result = stripDeletedFields({ _id: "abc", deletedAt: Date.now(), isDeleted: true, name: "test" });
    expect(result).not.toHaveProperty("deletedAt");
    expect(result).not.toHaveProperty("isDeleted");
    expect(result).toHaveProperty("name", "test");
  });

  it("returns a new object without mutating the original", () => {
    const original = { _id: "abc", deletedAt: 100, name: "test" };
    const result = stripDeletedFields(original);
    expect(result).not.toBe(original);
    expect(original).toHaveProperty("deletedAt");
  });
});
