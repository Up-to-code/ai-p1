import { describe, expect, it } from "vitest";
import { failedOutboxState, MAX_SEARCH_OUTBOX_ATTEMPTS } from "./outboxState";

describe("search outbox retry policy", () => {
  it("uses bounded exponential backoff", () => {
    expect(failedOutboxState(0, 10_000, "failure")).toMatchObject({ status: "pending", attempts: 1, nextAttemptAt: 11_000 });
    expect(failedOutboxState(20, 10_000, "failure").nextAttemptAt).toBe(10_000);
  });
  it("moves exhausted events to dead letter", () => {
    expect(failedOutboxState(MAX_SEARCH_OUTBOX_ATTEMPTS - 1, 10_000, "failure")).toMatchObject({ status: "dead_letter", attempts: MAX_SEARCH_OUTBOX_ATTEMPTS });
  });
});
