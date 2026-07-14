import { describe, expect, it } from "vitest";
import { failedExtractionState, MAX_EXTRACTION_ATTEMPTS } from "./extractionState";

describe("extraction retry state", () => {
  it("uses bounded retries and enters a dead-letter state", () => {
    expect(failedExtractionState(0, 1_000, "temporary")).toMatchObject({ status: "pending", attempts: 1, nextAttemptAt: 6_000 });
    expect(failedExtractionState(MAX_EXTRACTION_ATTEMPTS - 1, 2_000, "terminal")).toMatchObject({ status: "dead_letter", attempts: MAX_EXTRACTION_ATTEMPTS, nextAttemptAt: 2_000 });
  });
});
