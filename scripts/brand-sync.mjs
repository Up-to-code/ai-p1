#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const brandSource = readFileSync(join(root, "packages/brand-identity/src/index.ts"), "utf8");
const slug = brandSource.match(/slug:\s*"([^"]+)"/u)?.[1] ?? "qentrah";
const packageScope = brandSource.match(/packageScope:\s*"([^"]+)"/u)?.[1] ?? "@qentrah";
const envPrefix = brandSource.match(/envPrefix:\s*"([^"]+)"/u)?.[1] ?? "QENTRAH";

console.log(`Brand static sync check`);
console.log(`- slug: ${slug}`);
console.log(`- package scope: ${packageScope}`);
console.log(`- env prefix: ${envPrefix}`);
console.log("");
console.log("This repository keeps package names, import specifiers, route folders, and legacy env names stable by default.");
console.log("If you change slug/packageScope/envPrefix in packages/brand-identity/src/index.ts, update static metadata intentionally:");
console.log("- package.json workspace names and npm scripts");
console.log("- tsconfig/vitest path aliases");
console.log("- route folders or compatibility route handlers");
console.log("- deployment env names, keeping legacy aliases until integrations migrate");
console.log("- docs examples and generated SDK snippets");
