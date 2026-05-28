import { describe, expect, it } from "vitest";
import {
  activeJourneyClients,
  availableClientUnits,
  calendarEventsForClients,
  clientsForStageFilter,
  clientPipelineStageIndex,
  clientUnitPickerProjection,
  clientUnitPickerResults,
  clientTaskActivityRows,
  clientTaskDueDateLabel,
  clientTaskStatusTone,
  clientTaskUpdatePayload,
  displayedClientsForView,
  isActivePipelineStage,
  matchesClientSearch,
  matchesClientUnitSearch,
} from "./client-view-model";

const clients = [
  { id: "c1", name: "Noura", contact: "noura@example.com", propertyInterest: "Villa", budget: "2M", pipelineStage: "new" },
  { id: "c2", name: "Omar", contact: "omar@example.com", propertyInterest: "Office", budget: "1M", pipelineStage: "viewing" },
  { id: "c3", name: "Sara", contact: "sara@example.com", propertyInterest: "Retail", budget: "4M", pipelineStage: "closed" },
];

describe("client view-model", () => {
  it("matches client search fields", () => {
    expect(matchesClientSearch(clients[0], "")).toBe(true);
    expect(matchesClientSearch(clients[0], "villa")).toBe(true);
    expect(matchesClientSearch(clients[0], "NOURA@")).toBe(true);
    expect(matchesClientSearch(clients[0], "retail")).toBe(false);
  });

  it("projects clients by pipeline stage and view", () => {
    expect(isActivePipelineStage("new")).toBe(true);
    expect(isActivePipelineStage("closed")).toBe(false);
    expect(clientPipelineStageIndex("viewing")).toBe(2);
    expect(clientPipelineStageIndex("legacy")).toBe(0);
    expect(activeJourneyClients(clients).map((client) => client.id)).toEqual(["c1", "c2"]);
    expect(clientsForStageFilter(clients, "active").map((client) => client.id)).toEqual(["c1", "c2"]);
    expect(clientsForStageFilter(clients, "closed").map((client) => client.id)).toEqual(["c3"]);
    expect(displayedClientsForView(clients, "pipeline", "all").map((client) => client.id)).toEqual(["c1", "c2"]);
    expect(displayedClientsForView(clients, "list", "closed").map((client) => client.id)).toEqual(["c3"]);
    expect(displayedClientsForView(clients, "calendar", "closed").map((client) => client.id)).toEqual(["c1", "c2", "c3"]);
  });

  it("keeps only calendar events with visible clients or no client binding", () => {
    const events = [
      { id: "e1", clientId: "c1" },
      { id: "e2", clientId: "missing" },
      { id: "e3" },
      { id: "e4", clientId: null },
    ];

    expect(calendarEventsForClients(events, clients.slice(0, 1)).map((event) => event.id)).toEqual(["e1", "e3", "e4"]);
  });

  it("projects client activity task display rows", () => {
    const dueAt = new Date("2026-05-28T12:00:00").getTime();
    const tasks = [
      { id: "task_1", status: "done", propertyId: "unit_1", dueAt },
      { id: "task_2", status: "open", propertyId: "missing" },
      { id: "task_3", status: "canceled", dueAt: Number.NaN },
    ];
    const rows = clientTaskActivityRows(tasks, [{ id: "unit_1", title: "Villa" }], "en-US", "No date");

    expect(clientTaskDueDateLabel(undefined, "en-US", "No date")).toBe("No date");
    expect(clientTaskDueDateLabel(Number.NaN, "en-US", "No date")).toBe("No date");
    expect(clientTaskStatusTone("done")).toBe("success");
    expect(clientTaskStatusTone("canceled")).toBe("neutral");
    expect(clientTaskStatusTone("open")).toBe("warning");
    expect(rows[0]).toMatchObject({
      isDone: true,
      statusTone: "success",
      dueDateLabel: "5/28/2026",
      linkedUnit: { id: "unit_1", title: "Villa" },
    });
    expect(rows[1].linkedUnit).toBeUndefined();
    expect(rows[1].dueDateLabel).toBe("No date");
    expect(rows[2].statusTone).toBe("neutral");
  });

  it("builds complete client task update payloads from existing task rows", () => {
    expect(clientTaskUpdatePayload({
      title: "Follow up",
      status: "open",
      priority: "high",
      dueAt: 123,
      propertyId: "unit_1",
      projectId: "project_1",
      calendarEventId: "event_1",
      notes: "Call",
    }, "client_1", { status: "done", visibility: "public" })).toEqual({
      clientId: "client_1",
      title: "Follow up",
      status: "done",
      visibility: "public",
      priority: "high",
      dueAt: 123,
      propertyId: "unit_1",
      projectId: "project_1",
      calendarEventId: "event_1",
      notes: "Call",
    });
  });

  it("filters unit picker rows by linked unit, status, search, and limit", () => {
    const units = [
      { id: "u1", title: "Tower 1", project: "North", price: "1M", area: "120", status: "available" as const, reference: "A1" },
      { id: "u2", title: "Tower 2", project: "South", price: "2M", area: "140", status: "sold" as const, reference: "B2" },
      { id: "u3", title: "Garden", project: "North", price: "3M", area: "160", status: "available" as const, reference: "C3" },
    ];
    const linkedUnits = [{ link: { propertyId: "u1" } }];

    expect(availableClientUnits(units, linkedUnits).map((unit) => unit.id)).toEqual(["u2", "u3"]);
    expect(matchesClientUnitSearch(units[2], "garden")).toBe(true);
    expect(matchesClientUnitSearch(units[2], "zzz")).toBe(false);
    expect(clientUnitPickerProjection(units, linkedUnits, "available", "north", 1)).toEqual({
      availableUnits: [units[1], units[2]],
      filteredAvailableUnits: [units[2]],
      visibleAvailableUnits: [units[2]],
    });
    expect(clientUnitPickerResults(units, linkedUnits, "available", "north", 1).map((unit) => unit.id)).toEqual(["u3"]);
    expect(clientUnitPickerResults(units, linkedUnits, "all", "", 1).map((unit) => unit.id)).toEqual(["u2"]);
  });
});
