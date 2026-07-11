import { describe, expect, it } from "vitest";
import {
  activeJourneyClients,
  availableClientAssets,
  calendarEventsForClients,
  clientsForStageFilter,
  clientPipelineStageIndex,
  clientAssetPickerProjection,
  clientAssetPickerResults,
  clientTaskActivityRows,
  clientTaskDueDateLabel,
  clientTaskStatusTone,
  clientTaskUpdatePayload,
  clientToFormValues,
  displayedClientsForView,
  isActivePipelineStage,
  matchesClientSearch,
  matchesClientAssetSearch,
} from "./client-view-model";

const clients = [
  { id: "c1", name: "Noura", contact: "noura@example.com", assetInterest: "Onboarding workspace", budget: "20K", pipelineStage: "new" },
  { id: "c2", name: "Omar", contact: "omar@example.com", assetInterest: "Office rollout", budget: "10K", pipelineStage: "qualified" },
  { id: "c3", name: "Sara", contact: "sara@example.com", assetInterest: "Retail", budget: "4M", pipelineStage: "closed" },
];

describe("client view-model", () => {
  it("preserves editable CRM fields when preparing an update", () => {
    const values = clientToFormValues({
      name: "Meridian Group",
      type: "organization",
      contact: "hello@meridian.test",
      phone: "+20 100 000 0000",
      company: "Meridian",
      contactName: "Nadia",
      website: "https://meridian.test",
      source: "referral",
      lastContact: "2026-07-10",
      budget: "25000",
      assetInterest: "Operations retainer",
      status: "active",
      pipelineStage: "qualified",
      priority: "high",
      visibility: "team",
      notes: "Important account",
      tags: ["VIP"],
    } as any);

    expect(values).toMatchObject({
      company: "Meridian",
      contactName: "Nadia",
      website: "https://meridian.test",
      source: "referral",
      lastContact: "2026-07-10",
      notes: "Important account",
    });
  });

  it("matches client search fields", () => {
    expect(matchesClientSearch(clients[0], "")).toBe(true);
    expect(matchesClientSearch(clients[0], "workspace")).toBe(true);
    expect(matchesClientSearch(clients[0], "NOURA@")).toBe(true);
    expect(matchesClientSearch(clients[0], "retail")).toBe(false);
  });

  it("projects clients by pipeline stage and view", () => {
    expect(isActivePipelineStage("new")).toBe(true);
    expect(isActivePipelineStage("viewing")).toBe(true);
    expect(isActivePipelineStage("closed")).toBe(false);
    expect(clientPipelineStageIndex("qualified")).toBe(1);
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
      { id: "task_1", status: "done", assetId: "asset_1", dueAt },
      { id: "task_2", status: "todo", assetId: "missing" },
      { id: "task_3", status: "canceled", dueAt: Number.NaN },
    ];
    const rows = clientTaskActivityRows(tasks, [{ id: "asset_1", title: "Asset" }], "en-US", "No date");

    expect(clientTaskDueDateLabel(undefined, "en-US", "No date")).toBe("No date");
    expect(clientTaskDueDateLabel(Number.NaN, "en-US", "No date")).toBe("No date");
    expect(clientTaskStatusTone("done")).toBe("success");
    expect(clientTaskStatusTone("canceled")).toBe("neutral");
    expect(clientTaskStatusTone("todo")).toBe("warning");
    expect(rows[0]).toMatchObject({
      isDone: true,
      statusTone: "success",
      dueDateLabel: "5/28/2026",
      linkedAsset: { id: "asset_1", title: "Asset" },
    });
    expect(rows[1].linkedAsset).toBeUndefined();
    expect(rows[1].dueDateLabel).toBe("No date");
    expect(rows[2].statusTone).toBe("neutral");
  });

  it("builds complete client task update payloads from existing task rows", () => {
    expect(clientTaskUpdatePayload({
      title: "Follow up",
      status: "todo",
      priority: "high",
      dueDate: "2026-05-28",
      description: "Call",
    }, "client_1", { status: "done", visibility: "workspace" })).toEqual({
      title: "Follow up",
      status: "done",
      visibility: "workspace",
      priority: "high",
      dueDate: "2026-05-28",
      description: "Call",
    });
  });

  it("filters asset picker rows by linked asset, status, search, and limit", () => {
    const assets = [
      { id: "a1", title: "Brief 1", project: "North", price: "1K", area: "Shared", status: "available" as const, reference: "A1", bedrooms: 0, bathrooms: 0 },
      { id: "a2", title: "Resource 2", project: "South", price: "2K", area: "Team", status: "sold" as const, reference: "B2", bedrooms: 0, bathrooms: 0 },
      { id: "a3", title: "Checklist", project: "North", price: "3K", area: "Ops", status: "available" as const, reference: "C3", bedrooms: 0, bathrooms: 0 },
    ];
    const linkedAssets = [{ link: { assetId: "a1" } }];

    expect(availableClientAssets(assets, linkedAssets).map((asset) => asset.id)).toEqual(["a2", "a3"]);
    expect(matchesClientAssetSearch(assets[2], "checklist")).toBe(true);
    expect(matchesClientAssetSearch(assets[2], "zzz")).toBe(false);
    expect(clientAssetPickerProjection(assets, linkedAssets, "available", "north", 1)).toEqual({
      availableAssets: [assets[1], assets[2]],
      filteredAvailableAssets: [assets[2]],
      visibleAvailableAssets: [assets[2]],
    });
    expect(clientAssetPickerResults(assets, linkedAssets, "available", "north", 1).map((asset) => asset.id)).toEqual(["a3"]);
    expect(clientAssetPickerResults(assets, linkedAssets, "all", "", 1).map((asset) => asset.id)).toEqual(["a2"]);
  });
});
