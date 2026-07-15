import { describe, expect, it } from "vitest";
import { reportSourceResources } from "./access";

describe("report source access mapping", () => {
  it("maps report sources to their authoritative resource permissions", () => {
    expect(reportSourceResources("executive")).toEqual(["organization"]);
    expect(reportSourceResources("sales")).toEqual(["client", "deal"]);
    expect(reportSourceResources("delivery")).toEqual(["project"]);
    expect(reportSourceResources("resource_utilization")).toEqual(["team", "project"]);
    expect(reportSourceResources("client_profitability")).toEqual(["finance"]);
    expect(reportSourceResources("tax")).toEqual(["finance"]);
  });
});
