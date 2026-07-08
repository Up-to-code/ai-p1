import { describe, expect, it } from "vitest";
import { normalizeDomainError } from "./errors";
import { updateProfileInputSchema } from "./profiles";
import type { AdminOAuthAuthorizationPrompt } from "./oauth";
import {
  workOsAssetRecordSchema,
  workOsCalendarEventRecordSchema,
  workOsClientRecordSchema,
  workOsCustomFieldValueSchema,
  workOsOpportunityRecordSchema,
  workOsProjectRecordSchema,
  workOsRecordLinkSchema,
  workOsTaskRecordSchema,
  workOsTemplateSchema,
} from "./workOs";

describe("@qentrah/domain-contracts", () => {
  it("keeps platform error normalization available", () => {
    expect(
      normalizeDomainError({
        data: { code: "VERIFICATION_REQUIRED", message: "Verification needed" },
      }).status,
    ).toBe(403);
  });

  it("accepts web profile directory visibility while keeping it optional", () => {
    expect(
      updateProfileInputSchema.parse({
        name: "Ahmed Mansour",
        username: "ahmed.mansour",
        showInOffersDirectory: true,
      }).showInOffersDirectory,
    ).toBe(true);
  });

  it("keeps admin OAuth prompts narrower than web prompts", () => {
    const adminPrompt = {
      flowId: "flow-1",
      client: { clientId: "client-1", name: "External Publisher", publisherName: "Qentrah" },
      user: { email: "admin@qentrah.test" },
      state: "state",
      redirectUri: "https://app.test/callback",
      requestedScopes: [{ id: "assets:read", label: "Read assets" }],
      offlineAccess: false,
      requiresConsent: true,
      existingAuthorization: null,
    } satisfies AdminOAuthAuthorizationPrompt;

    expect(adminPrompt).not.toHaveProperty("organizations");
  });

  it("accepts Work OS templates with industry custom fields", () => {
    const template = workOsTemplateSchema.parse({
      key: "consulting_services",
      name: "Consulting services",
      category: "industry",
      status: "active",
      opportunityStages: ["new", "qualified", "proposal", "won"],
      customFieldDefinitions: [
        {
          key: "complianceReference",
          label: "Compliance reference",
          type: "text",
          required: false,
          appliesTo: ["asset", "project"],
          templateId: "consulting_services",
        },
      ],
      views: [{ recordType: "opportunity", type: "board", name: "Pipeline" }],
    });

    expect(template.customFieldDefinitions[0]?.appliesTo).toEqual(["asset", "project"]);
  });

  it("keeps Work OS custom field values typed", () => {
    expect(
      workOsCustomFieldValueSchema.parse({
        fieldKey: "contractValue",
        type: "number",
        numberValue: 125000,
      }).numberValue,
    ).toBe(125000);

    expect(() =>
      workOsCustomFieldValueSchema.parse({
        fieldKey: "contractValue",
        type: "number",
        textValue: "125000",
      }),
    ).toThrow(/numberValue/);
  });

  it("accepts generic Work OS core records", () => {
    expect(workOsClientRecordSchema.parse({
      organizationId: "org_1",
      name: "Acme",
      type: "organization",
      ownerId: "user_1",
    }).status).toBe("new");

    expect(workOsOpportunityRecordSchema.parse({
      organizationId: "org_1",
      title: "Expansion package",
      ownerId: "user_1",
      value: 25000,
    }).stage).toBe("new");

    expect(workOsProjectRecordSchema.parse({
      organizationId: "org_1",
      name: "Implementation",
      ownerId: "user_1",
    }).health).toBe("onTrack");

    expect(workOsTaskRecordSchema.parse({
      organizationId: "org_1",
      title: "Prepare kickoff",
    }).status).toBe("todo");

    expect(workOsCalendarEventRecordSchema.parse({
      organizationId: "org_1",
      title: "Kickoff",
      type: "meeting",
      startAt: "2026-06-06T09:00:00.000Z",
      endAt: "2026-06-06T10:00:00.000Z",
    }).type).toBe("meeting");

    expect(workOsAssetRecordSchema.parse({
      organizationId: "org_1",
      name: "Statement of work",
      type: "document",
      ownerId: "user_1",
    }).status).toBe("draft");
  });

  it("links only core Work OS records", () => {
    expect(
      workOsRecordLinkSchema.parse({
        organizationId: "org_1",
        linkType: "related",
        source: { recordType: "opportunity", recordId: "opp_1" },
        target: { recordType: "asset", recordId: "asset_1" },
      }).source.recordType,
    ).toBe("opportunity");

    expect(() =>
      workOsRecordLinkSchema.parse({
        organizationId: "org_1",
        linkType: "related",
        source: { recordType: "media", recordId: "media_1" },
        target: { recordType: "asset", recordId: "asset_1" },
      }),
    ).toThrow();
  });
});
