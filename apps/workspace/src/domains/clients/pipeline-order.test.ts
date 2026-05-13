import { describe, expect, it } from "vitest";
import { nextPipelineOrder, sortPipelineClients } from "./pipeline-order";

describe("client pipeline ordering", () => {
  it("sorts clients by saved pipeline order before update time", () => {
    expect(sortPipelineClients([
      { id: "later", pipelineOrder: 30, updatedAt: 300 },
      { id: "first", pipelineOrder: 10, updatedAt: 100 },
      { id: "middle", pipelineOrder: 20, updatedAt: 200 },
    ]).map((client) => client.id)).toEqual(["first", "middle", "later"]);
  });

  it("calculates a persistent order for drops at start, middle, and end", () => {
    const stage = [
      { id: "a", pipelineOrder: 10 },
      { id: "b", pipelineOrder: 20 },
      { id: "c", pipelineOrder: 30 },
    ];

    expect(nextPipelineOrder(stage, "moving", 0)).toBe(9);
    expect(nextPipelineOrder(stage, "moving", 1)).toBe(15);
    expect(nextPipelineOrder(stage, "moving", 99)).toBe(31);
  });

  it("removes the moving client before calculating its new slot", () => {
    const stage = [
      { id: "a", pipelineOrder: 10 },
      { id: "moving", pipelineOrder: 20 },
      { id: "c", pipelineOrder: 30 },
    ];

    expect(nextPipelineOrder(stage, "moving", 1)).toBe(20);
  });
});
