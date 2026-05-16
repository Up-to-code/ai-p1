import { describe, expect, it } from "vitest";
import type { Id } from "../_generated/dataModel";
import { partnerConnectionCanonicalPatch } from "./migrations";

const connectionId = "connection_1" as Id<"organizationPartnerConnections">;

describe("partner connection canonical field migration", () => {
  it("converts legacy partner connection ids to canonical fields", () => {
    expect(partnerConnectionCanonicalPatch({
      _id: connectionId,
      partnerAppId: "partners_app_1",
      oauthClientId: "partners_client_1",
    })).toEqual({
      partnersAppId: "partners_app_1",
      partnersClientId: "partners_client_1",
      partnerAppId: undefined,
      oauthClientId: undefined,
    });
  });

  it("preserves existing canonical field values", () => {
    expect(partnerConnectionCanonicalPatch({
      _id: connectionId,
      partnersAppId: "partners_app_current",
      partnerAppId: "partners_app_legacy",
      oauthClientId: "partners_client_legacy",
    })).toEqual({
      partnersAppId: "partners_app_current",
      partnersClientId: "partners_client_legacy",
      partnerAppId: undefined,
      oauthClientId: undefined,
    });
  });

  it("skips connections with no complete legacy source", () => {
    expect(partnerConnectionCanonicalPatch({
      _id: connectionId,
      partnerAppId: "partners_app_1",
    })).toBeNull();
  });
});
