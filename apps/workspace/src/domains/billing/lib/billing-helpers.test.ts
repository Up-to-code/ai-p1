import { describe, expect, it } from "vitest";
import { totalPriceForSeats } from "./billing-helpers";

describe("billing helpers", () => {
  it("calculates seat totals from plan config", () => {
    expect(totalPriceForSeats(3)).toBe(20.97);
  });
});
