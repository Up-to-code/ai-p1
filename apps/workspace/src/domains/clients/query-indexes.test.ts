import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");
const schema = readFileSync(resolve(root, "convex/schema.ts"), "utf8");
const clientsRead = readFileSync(resolve(root, "convex/clients/read.ts"), "utf8");

describe("client detail query indexes", () => {
  it("keeps the indexes needed by client detail dependencies", () => {
    expect(schema).toContain('.index("by_client", ["organizationId", "clientId"])');
    expect(schema).toContain('.index("by_client_status", ["organizationId", "clientId", "status"])');
    expect(schema).toContain('.index("by_client_property", ["organizationId", "clientId", "propertyId"])');
    expect(schema).toContain('.index("by_property", ["organizationId", "propertyId"])');
    expect(schema).toContain('.index("by_organization_type", ["organizationId", "type"])');
  });

  it("uses indexed client task, event, and unit-link reads in the client detail path", () => {
    expect(clientsRead).toContain('.withIndex("by_client_status"');
    expect(clientsRead).toContain('.withIndex("by_client"');
    expect(clientsRead).toContain('.withIndex("by_property"');
    expect(clientsRead).toContain('"by_organization_type"');
  });
});
