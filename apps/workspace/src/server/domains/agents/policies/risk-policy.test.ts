import { describe, expect, it } from "vitest";
import { evaluateAgentRequestRisk, evaluateAgentToolRisk } from "./risk-policy";

describe("agent risk policy", () => {
  it("blocks member deletion requests", () => {
    expect(evaluateAgentRequestRisk("please delete this team member").allowed).toBe(false);
    expect(evaluateAgentToolRisk({ resource: "member", action: "delete" }).allowed).toBe(false);
  });

  it("blocks organization identity edits", () => {
    expect(evaluateAgentRequestRisk("rename the organization name to Anan Pro").allowed).toBe(false);
    expect(evaluateAgentToolRisk({ resource: "organization", action: "update" }).allowed).toBe(false);
  });

  it("blocks legal document edits", () => {
    expect(evaluateAgentRequestRisk("edit the legal registration document").allowed).toBe(false);
    expect(evaluateAgentToolRisk({ resource: "legal", action: "update", tool: "legal_document_update" }).allowed).toBe(false);
  });

  it("allows ordinary client and calendar requests", () => {
    expect(evaluateAgentRequestRisk("find client Ahmed and schedule a viewing").allowed).toBe(true);
    expect(evaluateAgentToolRisk({ resource: "calendar", action: "create" }).allowed).toBe(true);
  });
});
