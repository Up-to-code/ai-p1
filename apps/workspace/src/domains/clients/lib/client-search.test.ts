import { describe, expect, it } from "vitest";
import { matchesClientSearch } from "./client-search";

describe("matchesClientSearch", () => {
  const client = {
    name: "Acme Corp",
    contact: "Jane Doe",
    assetInterest: "Office space",
    budget: "$500k",
  };

  it("matches empty search", () => {
    expect(matchesClientSearch(client, "")).toBe(true);
  });

  it("matches by name fragment", () => {
    expect(matchesClientSearch(client, "acme")).toBe(true);
    expect(matchesClientSearch(client, "warehouse")).toBe(false);
  });
});
