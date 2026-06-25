import { describe, expect, it } from "vitest";
import type { Client } from "../store/clients.types";
import {
  clientStageBadgeClass,
  clientStatusBadgeClass,
  clientTableInitials,
  clientTablePageNumbers,
  clientTypeBadgeClass,
  filterClientTableRows,
  paginateClientTableRows,
  sortClientTableRows,
} from "./client-table-utils";

const baseClient = {
  id: "1",
  name: "Acme Corp",
  contact: "Jane Doe",
  phone: "",
  type: "organization",
  status: "active",
  pipelineStage: "qualified",
  lastContact: "2026-01-01",
  company: "Acme",
} as Client;

describe("client table utils", () => {
  it("builds initials from a name", () => {
    expect(clientTableInitials("Jane Doe")).toBe("JD");
    expect(clientTableInitials("solo")).toBe("S");
  });

  it("maps badge classes for status, stage, and type", () => {
    expect(clientStatusBadgeClass("active")).toContain("emerald");
    expect(clientStageBadgeClass("qualified")).toContain("emerald");
    expect(clientTypeBadgeClass("person")).toContain("sky");
  });

  it("filters and sorts rows", () => {
    const rows = [
      baseClient,
      { ...baseClient, id: "2", name: "Beta", status: "new", type: "person" },
    ];
    const filtered = filterClientTableRows(rows, "beta", {
      type: "",
      status: "",
      pipelineStage: "",
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.name).toBe("Beta");

    const sorted = sortClientTableRows(filtered, "name", "desc");
    expect(sorted[0]?.name).toBe("Beta");
  });

  it("paginates and builds page numbers", () => {
    const items = Array.from({ length: 20 }, (_, index) => String(index + 1));
    const page = paginateClientTableRows(items, 2, 15);
    expect(page.rows).toHaveLength(5);
    expect(page.totalPages).toBe(2);
    expect(clientTablePageNumbers(10, 5)).toEqual([1, "...", 4, 5, 6, "...", 10]);
  });
});
