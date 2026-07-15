import { describe, expect, it } from "vitest";
import { automationActionNeedsApproval } from "./commandAdapter";

describe("automation action approval policy", () => {
  it("gates commercial, delivery, and finance transitions", () => {
    for (const action of ["update_client", "accept_proposal", "activate_engagement", "approve_deliverable", "approve_change_order", "post_invoice", "record_payment", "close_accounting_period"]) expect(automationActionNeedsApproval(action)).toBe(true);
  });

  it("allows low-risk content actions after canonical permission evaluation", () => {
    expect(automationActionNeedsApproval("create_task")).toBe(false);
    expect(automationActionNeedsApproval("create_document")).toBe(false);
  });
});
