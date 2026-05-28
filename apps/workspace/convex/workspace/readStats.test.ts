import { describe, expect, it } from "vitest";
import {
  activeRows,
  auditStats,
  calendarStats,
  clientStats,
  projectStats,
  propertyStats,
} from "./readStats";
import type { Doc } from "../_generated/dataModel";

function client(input: Partial<Doc<"clients">>) {
  return input as Doc<"clients">;
}

function project(input: Partial<Doc<"projects">>) {
  return input as Doc<"projects">;
}

function unit(input: Partial<Doc<"propertyUnits">>) {
  return input as Doc<"propertyUnits">;
}

function calendarEvent(input: Partial<Doc<"calendarEvents">>) {
  return input as Doc<"calendarEvents">;
}

function auditEvent(input: Partial<Doc<"organizationAuditEvents">>) {
  return input as Doc<"organizationAuditEvents">;
}

describe("Workspace Convex read stats", () => {
  it("filters soft-deleted rows once for shared stats callers", () => {
    expect(activeRows([{ id: 1 }, { id: 2, deletedAt: 123 }])).toEqual([{ id: 1 }]);
  });

  it("counts active clients by status, type, and pipeline stage", () => {
    expect(clientStats([
      client({ status: "active", type: "Buyer", pipelineStage: "new" }),
      client({ status: "inactive", type: "Tenant", pipelineStage: "viewing" }),
      client({ status: "active", type: "Investor", pipelineStage: "closed" }),
      client({ status: "active", type: "Broker", pipelineStage: "qualified", deletedAt: 1 }),
    ])).toEqual({
      total: 3,
      active: 2,
      inactive: 1,
      buyers: 1,
      tenants: 1,
      investors: 1,
      brokers: 0,
      stages: {
        new: 1,
        qualified: 0,
        viewing: 1,
        negotiation: 0,
        closed: 1,
      },
    });
  });

  it("counts active projects by review status", () => {
    expect(projectStats([
      project({ status: "approved" }),
      project({ status: "pending" }),
      project({ status: "draft" }),
      project({ status: "rejected", deletedAt: 1 }),
    ])).toEqual({
      total: 3,
      approved: 1,
      pending: 1,
      draft: 1,
      rejected: 0,
    });
  });

  it("counts active properties by availability status", () => {
    expect(propertyStats([
      unit({ status: "available" }),
      unit({ status: "pending" }),
      unit({ status: "reserved" }),
      unit({ status: "sold" }),
      unit({ status: "draft", deletedAt: 1 }),
    ])).toEqual({
      total: 4,
      available: 1,
      pending: 1,
      reserved: 1,
      sold: 1,
      draft: 0,
    });
  });

  it("counts active calendar events by status and owner", () => {
    expect(calendarStats([
      calendarEvent({ status: "confirmed", owner: "A" }),
      calendarEvent({ status: "pending", owner: "A" }),
      calendarEvent({ status: "draft", owner: "B" }),
      calendarEvent({ status: "confirmed", owner: "C", deletedAt: 1 }),
    ])).toEqual({
      total: 3,
      confirmed: 1,
      pending: 1,
      draft: 1,
      owners: 2,
    });
  });

  it("counts audit events by action category and latest event", () => {
    expect(auditStats([
      auditEvent({ action: "organization.member.invited", createdAt: 10 }),
      auditEvent({ action: "client.created", createdAt: 8 }),
      auditEvent({ action: "other.action", createdAt: 7 }),
    ], (action) => {
      if (action.includes("member")) return "people";
      if (action.includes("client")) return "clients";
      return "other";
    })).toEqual({
      total: 3,
      people: 1,
      business: 1,
      latestAt: 10,
    });
  });
});
