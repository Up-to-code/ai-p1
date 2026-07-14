import { describe, expect, it } from "vitest";
import { highestScoringCandidates, isCurrentSearchCandidate } from "./hydrate";

describe("search candidate hydration policy", () => {
  it("rejects stale and deleted external candidates", () => {
    expect(isCurrentSearchCandidate({ version: 3 }, { version: 2 })).toBe(false);
    expect(isCurrentSearchCandidate({ version: 3, deletedAt: 10 }, { version: 3 })).toBe(false);
    expect(isCurrentSearchCandidate({ version: 3 }, { version: 3 })).toBe(true);
    expect(isCurrentSearchCandidate(null, { version: 3 })).toBe(false);
  });

  it("keeps the highest locale score for a repeated record", () => {
    const candidates = highestScoringCandidates([
      { resourceType: "task", resourceId: "task_1", version: 1, score: 0.4 },
      { resourceType: "task", resourceId: "task_1", version: 1, score: 0.9 },
      { resourceType: "project", resourceId: "project_1", version: 2, score: 0.7 },
    ] as const);
    expect(candidates).toHaveLength(2);
    expect(candidates.find((candidate) => candidate.resourceId === "task_1")?.score).toBe(0.9);
  });
});
