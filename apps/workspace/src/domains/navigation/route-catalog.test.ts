import { describe, expect, it } from "vitest";
import { forwardPersistentParams } from "@/lib/workspace-nav-params";
import { getActiveRailItem, getRouteId } from "./route-catalog";

describe("route catalog", () => {
  it("selects the active rail item without confusing /ws with nested routes", () => {
    expect(getActiveRailItem("/ws")).toBe("home");
    expect(getActiveRailItem("/ws-extra")).toBeNull();
    expect(getActiveRailItem("/ai")).toBe("ai");
    expect(getRouteId("/ws")).toBe("ws");
    expect(getRouteId("/ai")).toBe("ai");
  });

  it("matches nested canonical routes and locale-prefixed routes", () => {
    expect(getRouteId("/tasks/123")).toBe("tasks");
    expect(getRouteId("/ar/projects/123/overview")).toBe("projects");
    expect(getRouteId("/en/search")).toBe("search");
    expect(getRouteId("/en/crm/proposals")).toBe("proposals");
    expect(getRouteId("/ar/crm/contracts")).toBe("contracts");
    expect(getActiveRailItem("/en/delivery/engagements")).toBe("delivery");
    expect(getActiveRailItem("/en/search")).toBe("home");
    expect(getRouteId("/organization-extra")).toBeNull();
  });

  it("maps Client, Deal, and legacy Opportunity routes to the CRM domain", () => {
    expect(getActiveRailItem("/clients")).toBe("crm");
    expect(getActiveRailItem("/clients/123")).toBe("crm");
    expect(getRouteId("/opportunities")).toBe("deals");
    expect(getActiveRailItem("/opportunities")).toBe("crm");
    expect(getActiveRailItem("/opportunities/123")).toBe("crm");
    expect(getActiveRailItem("/deals")).toBe("crm");
    expect(getActiveRailItem("/deals/123")).toBe("crm");
  });

  it("resolves reviewed legacy aliases to the intended destination", () => {
    expect(getRouteId("/ws/inbox")).toBe("inbox");
    expect(getRouteId("/ws/channels")).toBe("channels");
    expect(getRouteId("/inbox/channels")).toBe("channels");
    expect(getRouteId("/organization/channels")).toBe("channels");
    expect(getRouteId("/ws/spaces")).toBe("spaces");
    expect(getRouteId("/inbox/spaces")).toBe("spaces");
    expect(getRouteId("/organization/spaces")).toBe("spaces");
  });

  it("strips persistent params that are not supported by the destination", () => {
    const current = new URLSearchParams("project=p1&space=s1&mode=ai&threadId=t1&state=encoded");
    expect(forwardPersistentParams("/organization", current)).toBe("/organization");
    expect(forwardPersistentParams("/tasks", current)).toBe("/tasks?project=p1&space=s1");
    expect(forwardPersistentParams("/ws", current)).toBe("/ws");
    expect(forwardPersistentParams("/ai", current)).toBe("/ai?mode=ai&threadId=t1&state=encoded");
    expect(forwardPersistentParams("/inbox", current)).toBe("/inbox");
    expect(forwardPersistentParams("/spaces", current)).toBe("/spaces");
    expect(forwardPersistentParams("/projects", current)).toBe("/projects");
    expect(forwardPersistentParams("/clients", current)).toBe("/clients");
    expect(forwardPersistentParams("/opportunities", current)).toBe("/opportunities");
    expect(forwardPersistentParams("/deals", current)).toBe("/deals");
  });

  it("switches secondary panel modes without leaking AI parameters into Workspace", () => {
    const current = new URLSearchParams("mode=ai&threadId=t1&state=encoded");

    expect(forwardPersistentParams("/ai", current)).toBe(
      "/ai?mode=ai&threadId=t1&state=encoded",
    );
    expect(
      forwardPersistentParams("/ws", current, {
        mode: "",
        threadId: "",
        state: "",
      }),
    ).toBe("/ws");
  });

  it("does not treat protocol-relative links as internal workspace links", () => {
    const current = new URLSearchParams("project=p1");
    expect(forwardPersistentParams("//example.com/tasks", current)).toBe("//example.com/tasks");
  });
});
