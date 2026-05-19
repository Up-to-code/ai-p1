import { existsSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import { readFileSync } from "node:fs";

const workspaceRoot = path.resolve(import.meta.dirname, "../../..");
const appRoot = path.join(workspaceRoot, "apps", "mobile");

function resolveMobileEnvFile() {
  const candidates = [
    path.join(appRoot, ".env.local"),
    path.join(appRoot, ".env"),
    path.join(workspaceRoot, ".env.local"),
    path.join(workspaceRoot, ".env"),
  ];

  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

function parseEnvFile(filePath) {
  const env = {};
  const source = readFileSync(filePath, "utf8");

  for (const rawLine of source.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    if (key) {
      env[key] = value;
    }
  }

  return env;
}

function getConvexEnvValue(name) {
  const result = spawnSync("npx", ["convex", "env", "get", name], {
    cwd: workspaceRoot,
    encoding: "utf8",
    shell: process.platform === "win32",
    env: {
      ...process.env,
      CI: process.env.CI ?? "1",
    },
  });

  if (result.status !== 0) {
    return null;
  }

  const value = result.stdout.trim();
  return value.length > 0 ? value : null;
}

const syncProcess = spawn("node", ["apps/mobile/scripts/syncConvexGenerated.mjs", "--watch"], {
  cwd: workspaceRoot,
  stdio: "inherit",
  shell: process.platform === "win32",
});

const forwardedArgs = process.argv.slice(2);
const normalizedArgs =
  forwardedArgs[0] === "dev" ? forwardedArgs.slice(1) : forwardedArgs;
const convexArgs = ["convex", "dev"];
const typecheckMode = process.env.CONVEX_TYPECHECK_MODE ?? "disable";
const envFile = resolveMobileEnvFile();

if (envFile) {
  convexArgs.push("--env-file", envFile);
  console.log(`[mobile convex] Using env file ${path.relative(workspaceRoot, envFile)}`);
} else {
  console.log("[mobile convex] No app-specific env file found, falling back to Convex defaults.");
}

const envFromFile = envFile ? parseEnvFile(envFile) : {};
const workerConvexUrl = process.env.CONVEX_URL ?? envFromFile.CONVEX_URL ?? envFromFile.EXPO_PUBLIC_CONVEX_URL;
const workerRuntimeEnv = { ...envFromFile };

for (const key of [
  "OPENROUTER_API_KEY",
  "OPENAI_API_KEY",
  "OPENROUTER_BASE_URL",
  "OPENROUTER_MODEL",
  "OPENAI_MODEL",
  "TAVILY_API_KEY",
]) {
  if (!process.env[key] && !workerRuntimeEnv[key]) {
    const value = getConvexEnvValue(key);
    if (value) {
      workerRuntimeEnv[key] = value;
    }
  }
}

if (typecheckMode) {
  convexArgs.push("--typecheck", typecheckMode);
  console.log(`[mobile convex] Convex dev typecheck mode: ${typecheckMode}`);
}

convexArgs.push(...normalizedArgs);

const convexProcess = spawn("npx", convexArgs, {
  cwd: workspaceRoot,
  stdio: "inherit",
  shell: process.platform === "win32",
  env: {
    ...process.env,
    CI: process.env.CI ?? "1",
  },
});

let workerProcess = null;
if (workerConvexUrl) {
  console.log(`[mobile convex] Starting agent worker with CONVEX_URL=${workerConvexUrl}`);
  workerProcess = spawn("npx", ["tsx", "scripts/agent-worker.ts"], {
    cwd: workspaceRoot,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: {
      ...process.env,
      ...workerRuntimeEnv,
      CONVEX_URL: workerConvexUrl,
    },
  });
} else {
  console.log("[mobile convex] Agent worker not started: missing CONVEX_URL or EXPO_PUBLIC_CONVEX_URL.");
}

function shutdown(code = 0) {
  if (!syncProcess.killed) {
    syncProcess.kill("SIGTERM");
  }
  if (workerProcess && !workerProcess.killed) {
    workerProcess.kill("SIGTERM");
  }
  if (!convexProcess.killed) {
    convexProcess.kill("SIGTERM");
  }
  process.exit(code);
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => shutdown(0));
}

syncProcess.on("exit", (code, signal) => {
  if (convexProcess.killed) {
    return;
  }
  if (signal || code !== 0) {
    console.error("[mobile convex] Generated sync watcher exited unexpectedly.");
    shutdown(code ?? 1);
  }
});

if (workerProcess) {
  workerProcess.on("exit", (code, signal) => {
    if (convexProcess.killed) {
      return;
    }
    if (signal || code !== 0) {
      console.error("[mobile convex] Agent worker exited unexpectedly.");
      shutdown(code ?? 1);
    }
  });
}

convexProcess.on("exit", (code, signal) => {
  if (!syncProcess.killed) {
    syncProcess.kill("SIGTERM");
  }
  if (workerProcess && !workerProcess.killed) {
    workerProcess.kill("SIGTERM");
  }
  if (signal) {
    process.exit(1);
    return;
  }
  process.exit(code ?? 0);
});
