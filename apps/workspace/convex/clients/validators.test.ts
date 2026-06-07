import { describe, expect, it } from "vitest";
import { resolveClientPipelineStage } from "./validators";

describe("resolveClientPipelineStage", () => {
  it("returns stored pipeline stage for active clients", () => {
    expect(resolveClientPipelineStage({ status: "active", pipelineStage: "qualified" })).toBe("qualified");
  });

  it("defaults to new when pipeline stage is missing", () => {
    expect(resolveClientPipelineStage({ status: "new" })).toBe("new");
  });

  it("forces closed for archived clients", () => {
    expect(resolveClientPipelineStage({ status: "archived", pipelineStage: "negotiation" })).toBe("closed");
  });
});
