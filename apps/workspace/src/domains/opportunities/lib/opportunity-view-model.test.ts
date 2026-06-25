import { describe, expect, it } from "vitest";
import { matchesOpportunitySearch, stageTone } from "./opportunity-view-model";

describe("opportunity view model", () => {
  it("matches search across title and tags", () => {
    expect(
      matchesOpportunitySearch(
        { title: "Enterprise deal", tags: ["q1"], nextStep: "", source: "" } as never,
        "enterprise",
      ),
    ).toBe(true);
  });

  it("maps won stage to success tone", () => {
    expect(stageTone("won")).toBe("success");
  });
});
