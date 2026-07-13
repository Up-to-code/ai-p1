import { describe, expect, it } from "vitest";
import {
  calendarPatchInput,
  clientInput,
  clientPatchInput,
  taskPatchInput,
} from "./toolInputs";

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

  it("preserves omission semantics for Client updates", () => {
    expect(clientPatchInput({ name: "Acme Group" })).toEqual({ name: "Acme Group" });
    expect(clientPatchInput({ email: "" })).toEqual({ email: "" });
    expect(clientPatchInput({ phone: "+201" })).not.toHaveProperty("name");
  });

  it("preserves omission and explicit relation clearing for Calendar updates", () => {
    expect(calendarPatchInput({ title: "Renamed" })).toEqual({ title: "Renamed" });
    expect(calendarPatchInput({ projectId: null })).toEqual({ projectId: undefined });
    expect(calendarPatchInput({ startAt: 100 })).not.toHaveProperty("endAt");
  });

  it("preserves omission and explicit relation clearing for Task updates", () => {
    expect(taskPatchInput({ status: "client-review" })).toEqual({
      status: "client-review",
    });
    expect(taskPatchInput({ projectId: null })).toEqual({ projectId: undefined });
    expect(taskPatchInput({ title: "Renamed" })).not.toHaveProperty("priority");
  });
});
