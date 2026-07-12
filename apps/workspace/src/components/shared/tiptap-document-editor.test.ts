import { describe, expect, it } from "vitest";
import { getNextCommandSelectionIndex } from "./tiptap-document-editor";

describe("getNextCommandSelectionIndex", () => {
  it("moves through command options without leaving the list bounds", () => {
    expect(getNextCommandSelectionIndex({ currentIndex: 0, itemCount: 3, key: "ArrowDown" })).toBe(1);
    expect(getNextCommandSelectionIndex({ currentIndex: 2, itemCount: 3, key: "ArrowDown" })).toBe(2);
    expect(getNextCommandSelectionIndex({ currentIndex: 2, itemCount: 3, key: "ArrowUp" })).toBe(1);
    expect(getNextCommandSelectionIndex({ currentIndex: 0, itemCount: 3, key: "ArrowUp" })).toBe(0);
  });

  it("supports absolute navigation keys", () => {
    expect(getNextCommandSelectionIndex({ currentIndex: 2, itemCount: 5, key: "Home" })).toBe(0);
    expect(getNextCommandSelectionIndex({ currentIndex: 0, itemCount: 5, key: "End" })).toBe(4);
  });

  it("keeps an empty command list on the first index", () => {
    expect(getNextCommandSelectionIndex({ currentIndex: 4, itemCount: 0, key: "ArrowDown" })).toBe(0);
    expect(getNextCommandSelectionIndex({ currentIndex: 4, itemCount: -1, key: "End" })).toBe(0);
  });
});
