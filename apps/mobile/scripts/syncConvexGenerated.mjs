import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import path from "node:path";

const workspaceRoot = path.resolve(import.meta.dirname, "../../..");
const sourceDir = path.join(workspaceRoot, "convex", "_generated");
const targetRoot = path.join(workspaceRoot, "apps", "mobile", "src", "persistence", "convex");
const targetDir = path.join(targetRoot, "_generated");
const watchMode = process.argv.includes("--watch");
const pollIntervalMs = 500;

function ensureTargetRoot() {
  mkdirSync(targetRoot, { recursive: true });
}

function syncGenerated() {
  ensureTargetRoot();

  if (!existsSync(sourceDir)) {
    console.warn(`[mobile convex] Skipping sync because ${sourceDir} does not exist yet.`);
    return;
  }

  rmSync(targetDir, { recursive: true, force: true });
  cpSync(sourceDir, targetDir, { recursive: true });

  console.log(`[mobile convex] Synced ${path.relative(workspaceRoot, sourceDir)} -> ${path.relative(workspaceRoot, targetDir)}`);
}

function readLatestMtimeMs(dir) {
  const stack = [dir];
  let latestMtimeMs = 0;

  while (stack.length > 0) {
    const currentDir = stack.pop();
    if (!currentDir || !existsSync(currentDir)) {
      continue;
    }

    const entries = readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(currentDir, entry.name);
      const stats = statSync(entryPath);
      latestMtimeMs = Math.max(latestMtimeMs, stats.mtimeMs);

      if (entry.isDirectory()) {
        stack.push(entryPath);
      }
    }
  }

  return latestMtimeMs;
}

syncGenerated();

if (watchMode) {
  if (!existsSync(sourceDir)) {
    console.warn("[mobile convex] Watch mode skipped because root convex/_generated is not available yet.");
    process.exit(0);
  }

  let lastSeenMtimeMs = readLatestMtimeMs(sourceDir);

  setInterval(() => {
    if (!existsSync(sourceDir)) {
      return;
    }

    const nextMtimeMs = readLatestMtimeMs(sourceDir);
    if (nextMtimeMs <= lastSeenMtimeMs) {
      return;
    }

    lastSeenMtimeMs = nextMtimeMs;
    syncGenerated();
  }, pollIntervalMs);

  console.log(`[mobile convex] Polling root convex/_generated every ${pollIntervalMs}ms for changes...`);
}
