import { describe, expect, it, vi } from "vitest";
import {
  createOpportunityRequest,
  deleteOpportunityRequest,
  opportunityPayloadFromForm,
  updateOpportunityRequest,
} from "./opportunities";
import type { OpportunityFormValues } from "../opportunities.types";

const values: OpportunityFormValues = {
  title: "Enterprise rollout",
  stage: "qualified",
  status: "open",
  priority: "high",
  value: "42000",
  currency: "usd",
  source: "Referral",
  closeDate: "2026-06-30",
  nextStep: "Scope delivery team",
  clientId: "client 1",
  projectId: "project 1",
  tags: "enterprise, services",
};

function okResponse(body: unknown = { opportunity: { id: "opp_1" } }) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

describe("opportunity request wrappers", () => {
  it("drops invalid numeric value text instead of sending null", () => {
    expect(opportunityPayloadFromForm({ ...values, value: "rer" }).value).toBeUndefined();
  });

  it("normalizes opportunity form values for the Work OS opportunity endpoint", () => {
    expect(opportunityPayloadFromForm(values)).toEqual({
      title: "Enterprise rollout",
      stage: "qualified",
      status: "open",
      priority: "high",
      value: 42000,
      currency: "usd",
      source: "Referral",
      closeDate: "2026-06-30",
      nextStep: "Scope delivery team",
      clientId: "client 1",
      projectId: "project 1",
      tags: ["enterprise", "services"],
    });
  });

  it("uses generic encoded opportunity mutation paths", async () => {
    const fetcher = vi.fn(async () => okResponse());
    vi.stubGlobal("fetch", fetcher);

    await createOpportunityRequest("org 1", values);
    await updateOpportunityRequest("org 1", "opp/1", values);
    await deleteOpportunityRequest("org 1", "opp/1");

    expect(fetcher).toHaveBeenNthCalledWith(1, "/api/v1/organizations/org%201/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(opportunityPayloadFromForm(values)),
    });
    expect(fetcher).toHaveBeenNthCalledWith(2, "/api/v1/organizations/org%201/opportunities/opp%2F1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(opportunityPayloadFromForm(values)),
    });
    expect(fetcher).toHaveBeenNthCalledWith(3, "/api/v1/organizations/org%201/opportunities/opp%2F1", {
      method: "DELETE",
      headers: undefined,
      body: undefined,
    });

    vi.unstubAllGlobals();
  });

  it("preserves opportunity request fallback errors", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("not-json", { status: 500 })));

    await expect(createOpportunityRequest("org_1", values)).rejects.toThrow("Opportunity request failed.");

    vi.unstubAllGlobals();
  });
});
