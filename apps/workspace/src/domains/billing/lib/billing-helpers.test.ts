import { describe, expect, it } from "vitest";
import {
  billableMemberUnits,
  canCreateAiCard,
  canInviteMember,
  canUseEnterpriseControls,
  subscriptionTotalForMembers,
  totalPriceForSeats,
} from "./billing-helpers";
import { GOOD_MONTHLY_PLAN } from "../config/plans.config";

describe("billing helpers", () => {
  it("bills one unit for one to three members, then adds one unit per extra member", () => {
    expect(billableMemberUnits(GOOD_MONTHLY_PLAN, 1)).toBe(1);
    expect(billableMemberUnits(GOOD_MONTHLY_PLAN, 3)).toBe(1);
    expect(billableMemberUnits(GOOD_MONTHLY_PLAN, 4)).toBe(2);
    expect(subscriptionTotalForMembers(GOOD_MONTHLY_PLAN, 4)).toBe(14);
    expect(totalPriceForSeats(3)).toBe(7);
  });

  it("reads plan access limits from the shared plan model", () => {
    expect(canInviteMember("good_monthly", 200)).toBe(true);
    expect(canCreateAiCard("good_monthly", 2)).toBe(true);
    expect(canCreateAiCard("good_monthly", 3)).toBe(false);
    expect(canUseEnterpriseControls("better_monthly")).toBe(false);
    expect(canUseEnterpriseControls("custom_monthly")).toBe(true);
  });
});
