import { describe, expect, it, vi } from "vitest";
import {
  buildHandlerRegistry,
  mcpHandlerManifest,
  readHandlers,
  writeHandlers,
  type HandlerManifestEntry,
} from "./registry";
import { mcpToolPermissionMap } from "../toolRegistry";
import type { ReadHandler } from "./shared";

const readHandler = vi.fn() as unknown as ReadHandler;

describe("MCP executable handler manifest", () => {
  it("has exactly one correctly classified handler for every MCP tool", () => {
    const declaredNames = Object.keys(mcpToolPermissionMap).sort();
    const manifestNames = mcpHandlerManifest.map((entry) => entry.name).sort();

    expect(manifestNames).toEqual(declaredNames);
    expect([...readHandlers.keys(), ...writeHandlers.keys()].sort()).toEqual(
      declaredNames,
    );
    expect(readHandlers.size + writeHandlers.size).toBe(declaredNames.length);
  });

  it("rejects duplicate handlers", () => {
    const manifest = [
      { name: "demo", kind: "read", handler: readHandler },
      { name: "demo", kind: "read", handler: readHandler },
    ] as const satisfies readonly HandlerManifestEntry[];

    expect(() =>
      buildHandlerRegistry(manifest, { demo: { action: "read" } }),
    ).toThrow("Duplicate MCP handler declaration: demo");
  });

  it("rejects missing, undeclared, and misclassified handlers", () => {
    expect(() =>
      buildHandlerRegistry([], { missing: { action: "read" } }),
    ).toThrow("MCP tools missing handlers: missing");
    expect(() =>
      buildHandlerRegistry(
        [{ name: "unknown", kind: "read", handler: readHandler }],
        {},
      ),
    ).toThrow("MCP handler has no declared tool contract: unknown");
    expect(() =>
      buildHandlerRegistry(
        [{ name: "demo", kind: "read", handler: readHandler }],
        { demo: { action: "update" } },
      ),
    ).toThrow("MCP handler demo is read but its contract is write");
  });
});
