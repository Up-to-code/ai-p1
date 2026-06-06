import { describe, expect, it } from "vitest";
import { clientInput } from "./toolInputs";

describe("MCP tool inputs", () => {
  it("creates defaulted client input with email contact only", () => {
    expect(clientInput({
      name: "Mona Saleh",
      email: "mona@example.com",
    })).toMatchObject({
      name: "Mona Saleh",
      type: "Buyer",
      contact: "mona@example.com",
      phone: "",
      age: 0,
      propertyInterest: "",
      pipelineStage: "new",
      priority: "normal",
      nextAction: "Follow up",
    });
  });

  it("creates defaulted client input with phone only", () => {
    expect(clientInput({
      name: "Mona Saleh",
      phone: "+20 100 000 0000",
    })).toMatchObject({
      contact: "+20 100 000 0000",
      phone: "+20 100 000 0000",
    });
  });

  it("rejects client input without a contact method", () => {
    expect(() => clientInput({ name: "Mona Saleh" })).toThrow("Provide either contact/email or phone");
  });
});
