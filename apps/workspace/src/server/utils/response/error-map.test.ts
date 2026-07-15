import { describe, expect, it } from "vitest";
import { classifyError, errorStatus } from "./error-map";

describe("server error mapping", () => {
  it("maps Convex authentication codes to HTTP 401", () => {
    const error = new Error('Uncaught ConvexError: {"code":"AUTHENTICATION_REQUIRED","message":"Authentication is required."}');
    expect(classifyError(error)).toBe("UNAUTHENTICATED");
    expect(errorStatus(error)).toBe(401);
  });
});
