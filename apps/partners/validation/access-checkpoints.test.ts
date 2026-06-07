import { describe, expect, it } from "vitest";
import { mergeCheckpointScopes } from "./access-checkpoints";

describe("access checkpoints", () => {
  it("deduplicates selected and manual scopes into the existing allowedScopes payload", () => {
    expect(mergeCheckpointScopes(["asset:read", "client:read"], "client:read\norganization:read")).toEqual([
      "asset:read",
      "client:read",
      "organization:read",
    ]);
  });
});
