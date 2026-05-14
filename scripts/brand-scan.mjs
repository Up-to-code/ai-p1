#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { relative } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = fileURLToPath(new URL("..", import.meta.url));

const patterns = [
  "\\bQentrah\\b",
  "أنان",
  "\\bQentrahd\\b",
  "#0b5cff",
  "#2563EB",
];

const allowPath = [
  /^packages\/brand-identity\//u,
  /^scripts\/brand-/u,
  /^package-lock\.json$/u,
  /^node_modules\//u,
  /^\.git\//u,
  /^\.impeccable\//u,
  /^apps\/.*\/\.next\//u,
  /^apps\/.*\/package-lock\.json$/u,
  /^apps\/workspace\/messages\//u,
  /^apps\/workspace\/public\/vectors\//u,
  /^apps\/partners\/content\/docs\//u,
  /^apps\/partners\/examples\//u,
  /^apps\/partners\/components\//u,
  /^apps\/partners\/lib\//u,
  /^apps\/partners\/app\/\(auth\)\//u,
  /^apps\/partners\/app\/\(portal\)\//u,
  /^apps\/partners\/app\/\(marketing\)\/policies\//u,
  /^apps\/partners\/\.env\.example$/u,
  /^apps\/workspace\/docs\//u,
  /^apps\/workspace\/src\/components\/landing\//u,
  /^apps\/workspace\/src\/components\/footer\.tsx$/u,
  /^apps\/workspace\/src\/components\/integrations\.tsx$/u,
  /^apps\/workspace\/src\/server\/protocols\/mcp\//u,
  /^apps\/workspace\/src\/app\/\[locale\]\/docs\//u,
  /^apps\/workspace\/convex\/auth\.ts$/u,
  /^packages\/[^/]+\/package\.json$/u,
  /^packages\/ag-ui\//u,
  /^packages\/testing\//u,
  /^packages\/domain-contracts\/src\/.*\.test\.ts$/u,
  /^packages\/web-foundation\/src\/.*\.test\.ts$/u,
  /^.*\.test\.[tj]sx?$/u,
  /^.*\/README\.md$/u,
  /^docs\//u,
  /^SETUP_AND_CONFIGURATION\.md$/u,
  /^DESIGN\.md$/u,
  /^PRODUCT\.md$/u,
  /^README\.md$/u,
];

const allowLine = [
  /@qentrah\//u,
  /"name":\s*"@?qentrah/u,
  /QENTRAH_/u,
  /qentrah-theme/u,
  /\/api\/auth\/qentrah/u,
  /\/api\/qentrah/u,
  /qentrah-review-callback/u,
  /qentrah\.sa/u,
  /qentrah\.test/u,
  /function .*Qentrah/u,
  /type .*Qentrah/u,
  /const .*Qentrah/u,
  /describe\(/u,
  /expect\(/u,
  /\.test\./u,
  /replaceAll\(/u,
  /var\(--brand-primary,/u,
  /brand-logo\.svg/u,
  /Qentrah-Event-/u,
  /Qentrah-Timestamp/u,
  /Qentrah-Delivery-Id/u,
  /Qentrah-Signature/u,
  /#2563EB/u,
];

const rg = spawnSync("rg", ["-n", "--hidden", "-S", patterns.join("|"), "."], {
  cwd: root,
  encoding: "utf8",
});

if (rg.status !== 0 && rg.status !== 1) {
  process.stderr.write(rg.stderr);
  process.exit(rg.status ?? 1);
}

const violations = [];

for (const line of rg.stdout.split("\n")) {
  if (!line.trim()) continue;
  const [file, lineNo, ...rest] = line.split(":");
  const rel = relative(root, file).replaceAll("\\", "/");
  const text = rest.join(":");
  if (allowPath.some((pattern) => pattern.test(rel))) continue;
  if (allowLine.some((pattern) => pattern.test(text))) continue;
  violations.push(`${rel}:${lineNo}:${text}`);
}

if (violations.length > 0) {
  console.error("Brand scan found hardcoded brand values outside the allowlist:");
  console.error(violations.slice(0, 80).join("\n"));
  if (violations.length > 80) console.error(`...and ${violations.length - 80} more`);
  process.exit(1);
}

console.log("Brand scan passed.");
