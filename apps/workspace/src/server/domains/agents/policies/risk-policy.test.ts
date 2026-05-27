import { describe, expect, it } from "vitest";
import { evaluateAgentRequestRisk, evaluateAgentToolRisk } from "./risk-policy";

describe("agent risk policy", () => {
  it("requires confirmation for member deletion requests", () => {
    expect(evaluateAgentRequestRisk("please delete this team member").state).toBe("requires_confirmation");
    expect(evaluateAgentToolRisk({ resource: "member", action: "delete" }).state).toBe("requires_confirmation");
  });

  it("requires confirmation for organization identity edits", () => {
    expect(evaluateAgentRequestRisk("rename the organization name to Qentrah Pro").state).toBe("requires_confirmation");
    expect(evaluateAgentToolRisk({ resource: "organization", action: "update" }).state).toBe("requires_confirmation");
  });

  it("blocks legal document edits", () => {
    expect(evaluateAgentRequestRisk("edit the legal registration document").state).toBe("blocked");
    expect(evaluateAgentToolRisk({ resource: "legal", action: "update", tool: "legal_document_update" }).state).toBe("blocked");
  });

  it("allows ordinary client and calendar requests", () => {
    expect(evaluateAgentRequestRisk("find client Ahmed and schedule a viewing").state).toBe("allowed");
    expect(evaluateAgentToolRisk({ resource: "calendar", action: "create" }).state).toBe("allowed");
  });
});
