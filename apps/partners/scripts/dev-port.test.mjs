import net from "node:net";
import { existsSync, mkdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { checkDevDependencies } from "./check-dev-deps.mjs";
import { findAvailablePort, parsePreferredPort } from "./dev-port.mjs";
import { clearNextDevCaches } from "./next-cache.mjs";

function listen(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen({ port, host: "::" }, () => resolve(server));
  });
}

describe("partners dev port selection", () => {
  it("parses the preferred port with a safe default", () => {
    expect(parsePreferredPort("3100")).toBe(3100);
    expect(parsePreferredPort("nope")).toBe(3002);
    expect(parsePreferredPort("70000")).toBe(3002);
  });

  it("skips a busy port and returns the next available port", async () => {
    const startPort = await findAvailablePort(4202);
    const server = await listen(startPort);
    try {
      const selectedPort = await findAvailablePort(startPort, { maxAttempts: 5 });
      expect(selectedPort).toBeGreaterThan(startPort);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("verifies modules needed by the Partners dev server are installed", () => {
    expect(checkDevDependencies({ paths: [fileURLToPath(new URL("..", import.meta.url))] })).toEqual({
      ok: true,
      missing: [],
    });
  });

  it("clears stale Next dev caches before booting Turbopack", () => {
    const packageDir = mkdtempSync(join(tmpdir(), "partners-next-cache-"));
    const turbopackCache = join(packageDir, ".next", "dev", "cache", "turbopack");
    const nextCache = join(packageDir, ".next", "cache");
    mkdirSync(turbopackCache, { recursive: true });
    mkdirSync(nextCache, { recursive: true });

    clearNextDevCaches(packageDir);

    expect(existsSync(turbopackCache)).toBe(false);
    expect(existsSync(nextCache)).toBe(false);
  });
});
