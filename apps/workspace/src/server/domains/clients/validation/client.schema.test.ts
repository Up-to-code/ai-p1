import { describe, expect, it } from "vitest";
import { clientPayloadSchema } from "./client.schema";

describe("client validation", () => {
  it("accepts a complete workspace client payload", () => {
    const parsed = clientPayloadSchema.parse({
      name: "Abdullah Al-Faisal",
      type: "person",
      email: "abdullah@example.com",
      phone: "+966 512 345 678",
      status: "active",
      pipelineStage: "qualified",
      pipelineOrder: 20,
      source: "manual",
      notes: "",
    });

    expect(parsed.email).toBe("abdullah@example.com");
    expect(parsed.pipelineStage).toBe("qualified");
    expect(parsed.pipelineOrder).toBe(20);
    expect(parsed.notes).toBeUndefined();
  });

  it("accepts a minimal client with email contact only", () => {
    const parsed = clientPayloadSchema.parse({
      name: "Mona Saleh",
      email: "mona@example.com",
    });

    expect(parsed).toMatchObject({
      name: "Mona Saleh",
      type: "person",
      email: "mona@example.com",
      status: "new",
      source: "manual",
    });
  });

  it("accepts a minimal client with phone only", () => {
    const parsed = clientPayloadSchema.parse({
      name: "Mona Saleh",
      phone: "+20 100 000 0000",
    });

    expect(parsed.phone).toBe("+20 100 000 0000");
  });

  it("accepts a client without any contact method", () => {
    const parsed = clientPayloadSchema.parse({
      name: "Mona Saleh",
    });

    expect(parsed).toMatchObject({
      name: "Mona Saleh",
      type: "person",
      status: "new",
    });
  });

  it("rejects invalid client identity and status values", () => {
    expect(() =>
      clientPayloadSchema.parse({
        name: "",
        type: "person",
        email: "mona",
        status: "lost",
      }),
    ).toThrow();
  });
});
