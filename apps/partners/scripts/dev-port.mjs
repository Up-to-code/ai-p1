import net from "node:net";
import { existsSync } from "node:fs";
import { join } from "node:path";

export function parsePreferredPort(value, fallback = 3002) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isInteger(parsed) && parsed > 0 && parsed < 65536 ? parsed : fallback;
}

export function canUsePort(port, host = "::") {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.once("error", () => resolve(false));
    server.listen({ port, host }, () => {
      server.close(() => resolve(true));
    });
  });
}

export async function findAvailablePort(startPort, options = {}) {
  const host = options.host ?? "::";
  const maxAttempts = options.maxAttempts ?? 25;
  for (let offset = 0; offset < maxAttempts; offset += 1) {
    const port = startPort + offset;
    if (port > 65535) break;
    if (await canUsePort(port, host)) {
      return port;
    }
  }
  throw new Error(`No available port found from ${startPort} after ${maxAttempts} attempts`);
}

export function hasNextDevLock(packageDir = process.cwd()) {
  return existsSync(join(packageDir, ".next", "dev", "lock"));
}

export async function resolveDevServerPlan(options = {}) {
  const preferredPort = parsePreferredPort(options.preferredPort, 3002);
  const packageDir = options.packageDir ?? process.cwd();
  const host = options.host ?? "::";
  const preferredPortAvailable = await canUsePort(preferredPort, host);

  if (!preferredPortAvailable && hasNextDevLock(packageDir)) {
    return {
      type: "already_running",
      port: preferredPort,
    };
  }

  return {
    type: "start",
    preferredPort,
    port: preferredPortAvailable
      ? preferredPort
      : await findAvailablePort(preferredPort + 1, { host }),
  };
}
