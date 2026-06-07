import { describe, expect, it } from "vitest";
import { clientInput } from "./toolInputs";

describe("MCP tool inputs", () => {
  it("creates defaulted client input with email contact only", () => {
    expect(clientInput({
      name: "Mona Saleh",
      email: "mona@example.com",
    })).toMatchObject({
      name: "Mona Saleh",
      type: "person",
      status: "new",
      source: "mcp",
      email: "mona@example.com",
    });
  });

  it("creates defaulted client input with phone only", () => {
    expect(clientInput({
      name: "Mona Saleh",
      phone: "+20 100 000 0000",
    })).toMatchObject({
      type: "person",
      status: "new",
      source: "mcp",
      phone: "+20 100 000 0000",
    });
  });

  it("creates an organization client without forcing contact data", () => {
    expect(clientInput({
      name: "Acme Operations",
      type: "organization",
    })).toMatchObject({
      name: "Acme Operations",
      type: "organization",
      status: "new",
      source: "mcp",
    });
  });
});
