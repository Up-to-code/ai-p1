#!/usr/bin/env node

import { createHash } from "node:crypto";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = fileURLToPath(new URL("..", import.meta.url));
const strict = process.argv.includes("--strict");
const errors = [];
const warnings = [];

async function json(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), "utf8"));
}

async function text(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

function fail(message) {
  errors.push(message);
}

async function packageManifests() {
  const files = ["package.json"];
  for (const parent of ["apps", "packages"]) {
    for (const entry of await readdir(path.join(root, parent), { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const candidate = path.join(parent, entry.name, "package.json");
      try {
        await access(path.join(root, candidate));
        files.push(candidate);
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
  }
  return files;
}

async function checkPackages() {
  for (const relativePath of await packageManifests()) {
    try {
      const manifest = await json(relativePath);
      if (manifest.license !== "BUSL-1.1") fail(`${relativePath}: license must be BUSL-1.1`);
      if (manifest.private !== true) fail(`${relativePath}: private must be true`);
    } catch (error) {
      fail(`${relativePath}: ${error.message}`);
    }
  }
}

async function checkLicensePacket() {
  const expectations = {
    LICENSE: [
      "Business Source License 1.1",
      "Licensor: Ahmed Mansour",
      "Licensed Work: Qentrah v0.1.0",
      "Change Date: July 15, 2030",
      "Change License: Apache License, Version 2.0",
      "USD 1,000,000",
    ],
    "COMMERCIAL-LICENSE.md": ["legal@qentrah.com", "USD 1,000,000"],
    "TRADEMARKS.md": ["Qentrah", "Modified builds and forks must replace Qentrah branding"],
    "SECURITY.md": ["legal@qentrah.com"],
    "CODE_OF_CONDUCT.md": ["legal@qentrah.com"],
    "LICENSE-APACHE-2.0": ["Apache License", "Version 2.0"],
  };
  for (const [file, markers] of Object.entries(expectations)) {
    try {
      const contents = await text(file);
      for (const marker of markers) {
        if (!contents.includes(marker)) fail(`${file}: missing required marker ${JSON.stringify(marker)}`);
      }
    } catch (error) {
      fail(`${file}: ${error.message}`);
    }
  }
}

async function checkAssets() {
  for (const excluded of ["Branding"]) {
    try {
      await access(path.join(root, excluded));
      fail(`${excluded}: protected source path must not exist`);
    } catch (error) {
      if (error.code !== "ENOENT") fail(`${excluded}: ${error.message}`);
    }
  }

  const protectedAssets = await json("config/protected-asset-fingerprints.json");
  const blocked = new Set(protectedAssets.fingerprints);
  const publicLogoPaths = new Set(
    (await text("config/public-logo-paths.txt"))
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#")),
  );
  const tracked = execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    { cwd: root },
  )
    .toString("utf8")
    .split("\0")
    .filter(Boolean);
  for (const relativePath of tracked) {
    let contents;
    try {
      contents = await readFile(path.join(root, relativePath));
    } catch (error) {
      if (error.code === "ENOENT") continue;
      throw error;
    }
    const digest = createHash("sha256").update(contents).digest("hex");
    if (blocked.has(digest) && !publicLogoPaths.has(relativePath)) {
      fail(`${relativePath}: matches a protected asset fingerprint outside an approved logo path`);
    }
  }

  const provenance = await json("docs/compliance/asset-provenance.json");
  const unresolved = provenance.entries.filter((entry) => entry.status === "review-required");
  if (unresolved.length) {
    const message = `asset provenance has ${unresolved.length} review-required entries`;
    if (strict) fail(message);
    else warnings.push(message);
  }
}

async function checkPublicationApproval() {
  if (!strict) return;
  try {
    const approval = await json("docs/legal/approvals/publication-v0.1.0.json");
    if (approval.release !== "v0.1.0") fail("publication approval must apply to v0.1.0");
    if (approval.status !== "approved" || approval.approved !== true) {
      fail("legal publication approval is still pending");
    }
    if (!approval.approvedBy || !approval.approvedAt) {
      fail("legal publication approval must record approvedBy and approvedAt");
    }
  } catch (error) {
    fail(`publication approval: ${error.message}`);
  }
}

await checkPackages();
await checkLicensePacket();
await checkAssets();
await checkPublicationApproval();

for (const warning of warnings) console.warn(`warning: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`error: ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Project license check passed${strict ? " in publication-strict mode" : ""}.`);
}
