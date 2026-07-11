import { describe, expect, it } from "vitest";
import { graphProblem, orderedReachableActions } from "./graph";

const nodes = [
  { id: "trigger", kind: "trigger" as const },
  { id: "first", kind: "action" as const },
  { id: "second", kind: "action" as const },
];

describe("automation graph", () => {
  it("follows connected actions in line order", () => {
    expect(orderedReachableActions(nodes, [
      { source: "trigger", target: "first" },
      { source: "first", target: "second" },
    ]).map((node) => node.id)).toEqual(["first", "second"]);
  });

  it("rejects disconnected actions", () => {
    expect(graphProblem(nodes, [{ source: "trigger", target: "first" }])).toBe("Every action must be connected to the trigger.");
  });

  it("rejects cycles", () => {
    expect(graphProblem(nodes, [
      { source: "trigger", target: "first" },
      { source: "first", target: "second" },
      { source: "second", target: "first" },
    ])).toBe("Workflow lines cannot create a cycle.");
  });
});
