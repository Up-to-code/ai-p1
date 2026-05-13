import { describe, expect, it } from "vitest";
import { actionForMethod, parseSandboxPath } from "./resources";

describe("sandbox mirrored Hub routes", () => {
  it("maps Hub-like paths to sandbox resources", () => {
    expect(parseSandboxPath(["me"])).toEqual({ resource: "organization", action: "read" });
    expect(parseSandboxPath(["clients"])).toEqual({ resource: "client", action: "read", resourceId: undefined });
    expect(parseSandboxPath(["clients", "client_1"])).toEqual({ resource: "client", action: "read", resourceId: "client_1" });
    expect(parseSandboxPath(["unknown"])).toBeNull();
  });

  it("allows CRUD methods only in valid collection shapes", () => {
    expect(actionForMethod("GET", false)).toBe("read");
    expect(actionForMethod("POST", false)).toBe("create");
    expect(actionForMethod("PATCH", true)).toBe("update");
    expect(actionForMethod("DELETE", true)).toBe("delete");
    expect(actionForMethod("DELETE", false)).toBeNull();
    expect(actionForMethod("POST", true)).toBeNull();
  });
});
