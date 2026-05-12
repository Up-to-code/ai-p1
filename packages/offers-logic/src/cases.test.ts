import { describe, expect, it } from "vitest";
import {
  isClosedStage,
  isOpenlyVisible,
  legacyPublicationStateFromStage,
  legacyStatusFromStage,
  resolveCaseType,
  resolveStageForPublish,
  resolveVisibility,
} from "./cases";

describe("@anan/offers-logic cases", () => {
  it("maps modern stages to legacy state", () => {
    expect(legacyStatusFromStage("closed_won")).toBe("accepted");
    expect(legacyStatusFromStage("closed_lost")).toBe("rejected");
    expect(legacyPublicationStateFromStage("draft")).toBe("draft");
  });

  it("resolves case type, visibility, and publish stages", () => {
    expect(resolveCaseType({ visibility: "public" })).toBe("open_offer");
    expect(resolveVisibility({ caseType: "open_offer" })).toBe("open");
    expect(resolveStageForPublish("private_offer")).toBe("targeted");
  });

  it("checks closed and public visibility", () => {
    expect(isClosedStage("archived")).toBe(true);
    expect(isOpenlyVisible({ stage: "open" }, { visibility: "public" })).toBe(true);
  });
});
