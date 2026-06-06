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

  it("accepts a minimal client with email contact only", () => {
    const parsed = clientPayloadSchema.parse({
      name: "Mona Saleh",
      contact: "mona@example.com",
    });

    expect(parsed).toMatchObject({
      name: "Mona Saleh",
      type: "Buyer",
      contact: "mona@example.com",
      phone: "",
      age: 0,
      status: "active",
      pipelineStage: "new",
      priority: "normal",
      nextAction: "Follow up",
    });
  });

  it("accepts a minimal client with phone only", () => {
    const parsed = clientPayloadSchema.parse({
      name: "Mona Saleh",
      phone: "+20 100 000 0000",
    });

    expect(parsed.contact).toBe("+20 100 000 0000");
    expect(parsed.phone).toBe("+20 100 000 0000");
  });

  it("rejects a client without any contact method", () => {
    expect(() =>
      clientPayloadSchema.parse({
        name: "Mona Saleh",
      }),
    ).toThrow("Provide either contact/email or phone");
  });

  it("rejects invalid client identity and stage values", () => {
    expect(() =>
      clientPayloadSchema.parse({
        name: "",
        type: "Buyer",
        contact: "mona",
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
