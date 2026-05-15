import { describe, expect, it } from "vitest";

import { UtilityLipsUtility } from "./utility-lips";

describe("UtilityLipsUtility", () => {
  it("keeps text within the default 20 character display limit", () => {
    expect(UtilityLipsUtility("NILE VISTA RESIDENCES - ETJAH MCP")).toBe("NILE VISTA RESIDENCE...");
  });

  it("does not add ellipsis to values already within the limit", () => {
    expect(UtilityLipsUtility("New Cairo")).toBe("New Cairo");
  });

  it("supports a custom character limit", () => {
    expect(UtilityLipsUtility("abcdefghijklmnop", 8)).toBe("abcdefgh...");
  });
});
