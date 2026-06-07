import { describe, expect, it } from "vitest";
import {
  activeRows,
  auditStats,
  calendarStats,
  clientStats,
  projectStats,
  assetStats,
} from "./readStats";
import type { Doc } from "../_generated/dataModel";

function client(input: Partial<Doc<"clients">>) {
  return input as Doc<"clients">;
}

function project(input: Partial<Doc<"projects">>) {
  return input as Doc<"projects">;
}

function asset(input: Partial<Doc<"assets">>) {
  return input as Doc<"assets">;
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

  it("counts active clients by status and client kind", () => {
    expect(clientStats([
      client({ status: "new", type: "person" }),
      client({ status: "active", type: "organization" }),
      client({ status: "nurture", type: "person" }),
      client({ status: "inactive", type: "organization" }),
      client({ status: "archived", type: "person", deletedAt: 1 }),
    ])).toEqual({
      total: 4,
      new: 1,
      active: 1,
      nurture: 1,
      inactive: 1,
      archived: 0,
      people: 2,
      organizations: 2,
    });
  });

  it("counts active projects by lifecycle status and health", () => {
    expect(projectStats([
      project({ status: "planned", health: "onTrack" }),
      project({ status: "active", health: "atRisk" }),
      project({ status: "paused", health: "blocked" }),
      project({ status: "completed", health: "onTrack" }),
      project({ status: "archived", health: "blocked", deletedAt: 1 }),
    ])).toEqual({
      total: 4,
      planned: 1,
      active: 1,
      paused: 1,
      completed: 1,
      archived: 0,
      onTrack: 2,
      atRisk: 1,
      blocked: 1,
    });
  });

  it("counts active assets by generic workflow status", () => {
    expect(assetStats([
      asset({ status: "draft" }),
      asset({ status: "active" }),
      asset({ status: "review" }),
      asset({ status: "approved" }),
      asset({ status: "archived", deletedAt: 1 }),
    ])).toEqual({
      total: 4,
      draft: 1,
      active: 1,
      review: 1,
      approved: 1,
      archived: 0,
    });
  });

  it("counts active calendar events by status and owner", () => {
    expect(calendarStats([
      calendarEvent({ status: "confirmed", ownerUserId: "A" }),
      calendarEvent({ status: "pending", ownerUserId: "A" }),
      calendarEvent({ status: "draft", ownerUserId: "B" }),
      calendarEvent({ status: "confirmed", ownerUserId: "C", deletedAt: 1 }),
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
