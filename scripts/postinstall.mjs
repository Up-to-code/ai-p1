#!/usr/bin/env node
import { existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const mobileRoot = join(repoRoot, "apps/mobile");
const mobilePatchDir = join("apps", "mobile", "patches");
const rootPatchDir = "patches";
const patchPackageBin = join(repoRoot, "node_modules", ".bin", "patch-package");

// Apply root-level patches (Clerk ESM fix, etc)
{
  const rootPatches = join(repoRoot, rootPatchDir);
  if (existsSync(rootPatches)) {
    const files = readdirSync(rootPatches);
    const patchFiles = files.filter((f) => f.endsWith(".patch"));
    if (patchFiles.length > 0) {
      const result = spawnSync(patchPackageBin, [], {
        cwd: repoRoot,
        stdio: "inherit",
        shell: process.platform === "win32",
      });
      if (result.status && result.status !== 0) {
        process.exit(result.status);
      }
    }
  }
}

function packagePath(name) {
  const rootPath = join(repoRoot, "node_modules", name);
  if (existsSync(rootPath)) return rootPath;
  const mobilePath = join(mobileRoot, "node_modules", name);
  if (existsSync(mobilePath)) return mobilePath;
  return null;
}

const expoNotificationsPath = packagePath("expo-notifications");
if (!expoNotificationsPath) {
  console.log("[postinstall] Skipping mobile patch-package (expo-notifications not installed).");
  process.exit(0);
}

const hoistedToRoot = expoNotificationsPath.startsWith(join(repoRoot, "node_modules"));
const cwd = hoistedToRoot ? repoRoot : mobileRoot;
const args = hoistedToRoot ? ["--patch-dir", mobilePatchDir] : [];

const command = existsSync(patchPackageBin) ? patchPackageBin : "npx";
const commandArgs = command === patchPackageBin ? args : ["patch-package", ...args];

const result = spawnSync(command, commandArgs, {
  cwd,
  stdio: "inherit",
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
