import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");
const schema = readFileSync(resolve(root, "convex/schema.ts"), "utf8");
const clientsRead = readFileSync(resolve(root, "convex/clients/read.ts"), "utf8");

describe("client detail query indexes", () => {
  it("keeps the indexes needed by client detail dependencies", () => {
    expect(schema).toContain("recordLinks: defineTable");
    expect(schema).toContain('.index("by_source", ["organizationId", "sourceRecordType", "sourceRecordId"])');
    expect(schema).toContain('.index("by_target", ["organizationId", "targetRecordType", "targetRecordId"])');
    expect(schema).toContain('.index("by_organization_client", ["organizationId", "clientId"])');
    expect(schema).toContain('.index("by_organization_type", ["organizationId", "type"])');
  });

  it("uses indexed linked-record and client reads in the client detail path", () => {
    expect(clientsRead).toContain('.withIndex("by_source"');
    expect(clientsRead).toContain('.withIndex("by_target"');
    expect(clientsRead).toContain('"by_organization_type"');
  });
});
