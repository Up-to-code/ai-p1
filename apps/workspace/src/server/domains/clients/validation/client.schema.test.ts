import { describe, expect, it } from "vitest";
import { clientPayloadSchema, clientUnitLinkPayloadSchema } from "./client.schema";

describe("client validation", () => {
  it("accepts a complete broker operating client payload", () => {
    const parsed = clientPayloadSchema.parse({
      name: "Abdullah Al-Faisal",
      type: "Buyer",
      contact: "abdullah@example.com",
      phone: "+966 512 345 678",
      age: "34",
      nationality: "Saudi",
      generation: "Millennial",
      budget: "900K - 1.2M SAR",
      propertyInterest: "2BR apartment, Riyadh",
      status: "active",
      pipelineStage: "qualified",
      pipelineOrder: 12.5,
      priority: "high",
      nextAction: "Send mortgage options",
      issue: "",
    });

    expect(parsed.age).toBe(34);
    expect(parsed.pipelineOrder).toBe(12.5);
    expect(parsed.issue).toBeUndefined();
  });

  it("rejects invalid client identity and stage values", () => {
    expect(() =>
      clientPayloadSchema.parse({
        name: "",
        type: "Buyer",
        contact: "not-email",
        phone: "123",
        age: 12,
        nationality: "Saudi",
        generation: "Millennial",
        budget: "900K",
        propertyInterest: "Apartment",
        status: "active",
        pipelineStage: "lost",
        priority: "high",
        nextAction: "Call",
      }),
    ).toThrow();
  });

  it("defaults client-unit links to interested", () => {
    expect(clientUnitLinkPayloadSchema.parse({ propertyId: "unit_123" })).toEqual({
      propertyId: "unit_123",
      status: "interested",
    });
  });
});
