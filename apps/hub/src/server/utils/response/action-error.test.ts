import { describe, expect, it } from "vitest";
import { actionErrorMessage, actionErrorStatus } from "./action-error";

describe("action error response mapping", () => {
  it("maps common auth and data failures to stable statuses", () => {
    expect(actionErrorStatus(new Error("Unauthenticated"))).toBe(401);
    expect(actionErrorStatus(new Error("You do not have permission to update this organization client."))).toBe(403);
    expect(actionErrorStatus(new Error("Client was not found."))).toBe(404);
    expect(actionErrorStatus(new Error("rate_limited"))).toBe(429);
    expect(actionErrorStatus(new Error("clientId is required."))).toBe(400);
  });

  it("does not leak unexpected internal errors", () => {
    expect(actionErrorMessage(new Error("database secret exploded"), "Client action failed.")).toBe("Client action failed.");
    expect(actionErrorMessage(new Error("Project was not found."), "Project action failed.")).toBe("The requested workspace record was not found.");
  });
});
