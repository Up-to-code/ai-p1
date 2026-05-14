#!/usr/bin/env node

import { spawn } from "node:child_process";
import { assertDevDependencies } from "./check-dev-deps.mjs";
import { parsePreferredPort, resolveDevServerPlan } from "./dev-port.mjs";
import { ensurePartnerDatabaseEnv, loadLocalEnv } from "./load-local-env.mjs";
import { clearNextDevCaches } from "./next-cache.mjs";

loadLocalEnv();
ensurePartnerDatabaseEnv();
assertDevDependencies();

const preferredPort = parsePreferredPort(process.env.PARTNERS_PORT ?? process.env.PORT, 3002);
const plan = await resolveDevServerPlan({ preferredPort });

if (plan.type === "already_running") {
  console.log(`Partners dev server is already running at http://localhost:${plan.port}.`);
  process.exit(0);
}

if (plan.port !== preferredPort) {
  console.log(`Port ${preferredPort} is busy; starting partners on ${plan.port}.`);
}

clearNextDevCaches();

const nextBin = process.platform === "win32" ? "next.cmd" : "next";
const child = spawn(nextBin, ["dev", "--webpack", "--port", String(plan.port)], {
  stdio: "inherit",
  env: {
    ...process.env,
    PORT: String(plan.port),
  },
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    child.kill(signal);
  });
}

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
