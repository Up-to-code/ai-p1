import { describe, expect, it } from "vitest";
import { assertCommercialTransition, assertProposalAcceptable, nextAgreedAmount } from "./transitions";

describe("agency commercial lifecycle", () => {
  it("permits only command-owned proposal, contract, deliverable, and change-order transitions", () => {
    expect(() => assertCommercialTransition({ aggregate: "proposal", from: "draft", command: "send", to: "sent" })).not.toThrow();
    expect(() => assertCommercialTransition({ aggregate: "contract", from: "sent", command: "sign", to: "signed" })).not.toThrow();
    expect(() => assertCommercialTransition({ aggregate: "deliverable", from: "submitted", command: "approve", to: "approved" })).not.toThrow();
    expect(() => assertCommercialTransition({ aggregate: "change_order", from: "submitted", command: "approve", to: "approved" })).not.toThrow();
  });

  it("rejects skipped lifecycle states", () => {
    expect(() => assertCommercialTransition({ aggregate: "contract", from: "draft", command: "activate", to: "active" })).toThrow(/Invalid/u);
    expect(() => assertCommercialTransition({ aggregate: "proposal", from: "draft", command: "accept", to: "accepted" })).toThrow(/Invalid/u);
  });

  it("rejects draft and expired proposal acceptance", () => {
    expect(() => assertProposalAcceptable("draft", undefined, 1_000)).toThrow(/sent/u);
    expect(() => assertProposalAcceptable("sent", 999, 1_000)).toThrow(/expired/u);
    expect(() => assertProposalAcceptable("sent", 1_000, 1_000)).not.toThrow();
  });

  it("applies approved change-order value without allowing a negative contract value", () => {
    expect(nextAgreedAmount(10_000, 2_500)).toBe(12_500);
    expect(nextAgreedAmount(10_000, -2_500)).toBe(7_500);
    expect(() => nextAgreedAmount(1_000, -1_001)).toThrow(/invalid/u);
  });
});
