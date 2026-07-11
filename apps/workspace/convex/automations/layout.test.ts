import { describe, expect, it } from "vitest";
import { automationLayoutUnchanged, mergeAutomationPositions } from "./layout";

const nodes = [
  { id: "a", x: 0, y: 10, label: "A" },
  { id: "b", x: 20, y: 30, label: "B" },
];

describe("automation layout persistence", () => {
  it("merges positions without replacing node data", () => {
    expect(mergeAutomationPositions(nodes, [
      { id: "a", x: 40, y: 50 },
      { id: "b", x: 60, y: 70 },
    ])).toEqual([
      { id: "a", x: 40, y: 50, label: "A" },
      { id: "b", x: 60, y: 70, label: "B" },
    ]);
  });

  it("rejects partial layouts", () => {
    expect(mergeAutomationPositions(nodes, [{ id: "a", x: 1, y: 2 }])).toBeNull();
  });

  it("detects idempotent viewport and position saves", () => {
    const viewport = { x: 10, y: 20, zoom: 0.9 };
    expect(automationLayoutUnchanged(nodes, nodes, viewport, viewport)).toBe(true);
    expect(automationLayoutUnchanged(nodes, nodes, viewport, { ...viewport, zoom: 1 })).toBe(false);
  });
});
