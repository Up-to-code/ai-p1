#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const rootPackagePath = resolve(repoRoot, "package.json");
const rootPackage = readJson(rootPackagePath);
const packageByName = discoverWorkspacePackages();

const alwaysBuildPaths = [
  "package.json",
  "package-lock.json",
  "vercel.json",
  ".npmrc",
  ".node-version",
  "tsconfig.json",
  "scripts/vercel-ignore.mjs",
];

function usage() {
  console.error([
    "Usage:",
    "  node scripts/vercel-ignore.mjs --workspace @qentrah/workspace",
    "",
    "Exit code 0 skips the Vercel build. Exit code 1 allows the build.",
  ].join("\n"));
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function parseArgs(argv) {
  const args = { workspaceName: "" };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--workspace" || value === "-w") {
      args.workspaceName = argv[index + 1] ?? "";
      index += 1;
      continue;
    }
    if (value === "--help" || value === "-h") {
      usage();
      process.exit(0);
    }
  }
  return args;
}

function git(args, options = {}) {
  return spawnSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: options.stdio ?? "pipe",
  });
}

function listWorkspacePackageFiles() {
  const patterns = rootPackage.workspaces ?? [];
  const files = [];
  for (const pattern of patterns) {
    if (!pattern.endsWith("/*")) continue;
    const parent = pattern.slice(0, -2);
    const result = git(["ls-files", `${parent}/*/package.json`]);
    if (result.status !== 0) continue;
    files.push(...result.stdout.split(/\r?\n/u).filter(Boolean));
  }
  return files;
}

function discoverWorkspacePackages() {
  const packages = new Map();
  for (const packageFile of listWorkspacePackageFiles()) {
    const fullPath = resolve(repoRoot, packageFile);
    if (!existsSync(fullPath)) continue;
    const manifest = readJson(fullPath);
    if (!manifest.name) continue;
    packages.set(manifest.name, {
      manifest,
      packageFile,
      dir: dirname(packageFile),
    });
  }
  return packages;
}

function localPackageDependencies(name, visited = new Set()) {
  if (visited.has(name)) return [];
  visited.add(name);

  const record = packageByName.get(name);
  if (!record) return [];

  const deps = {
    ...record.manifest.dependencies,
    ...record.manifest.devDependencies,
    ...record.manifest.optionalDependencies,
    ...record.manifest.peerDependencies,
  };
  const localDeps = Object.keys(deps).filter((depName) => packageByName.has(depName));

  return [
    record,
    ...localDeps.flatMap((depName) => localPackageDependencies(depName, visited)),
  ];
}

function currentHead() {
  const result = git(["rev-parse", "HEAD"]);
  return result.status === 0 ? result.stdout.trim() : "";
}

function baseSha() {
  const candidates = [
    process.env.VERCEL_GIT_PREVIOUS_SHA,
    process.env.VERCEL_GIT_COMMIT_REF ? `origin/${process.env.VERCEL_GIT_COMMIT_REF}` : "",
    "HEAD^",
  ].filter(Boolean);

  for (const candidate of candidates) {
    const result = git(["rev-parse", "--verify", `${candidate}^{commit}`]);
    if (result.status === 0) {
      const sha = result.stdout.trim();
      if (sha && sha !== currentHead()) return sha;
    }
  }

  return "";
}

function changedFiles(base) {
  const diffArgs = base
    ? ["diff", "--name-only", `${base}...HEAD`]
    : ["diff", "--name-only", "HEAD^", "HEAD"];
  const result = git(diffArgs);
  if (result.status !== 0) return null;
  return result.stdout.split(/\r?\n/u).filter(Boolean);
}

function normalizePath(path) {
  return path.replaceAll("\\", "/").replace(/^\.?\//u, "");
}

function matchesWatchedPath(file, watchedPath) {
  const normalizedFile = normalizePath(file);
  const normalizedWatched = normalizePath(watchedPath);
  return normalizedFile === normalizedWatched || normalizedFile.startsWith(`${normalizedWatched}/`);
}

const { workspaceName } = parseArgs(process.argv.slice(2));
if (!workspaceName || !packageByName.has(workspaceName)) {
  usage();
  process.exit(1);
}

const packageRecords = localPackageDependencies(workspaceName);
const watchedPaths = Array.from(new Set([
  ...alwaysBuildPaths,
  ...packageRecords.flatMap((record) => [record.dir, record.packageFile]),
])).filter((path) => existsSync(resolve(repoRoot, path)));

const base = baseSha();
if (!base) {
  console.log(`[vercel-ignore] ${workspaceName}: no comparable base commit found, building.`);
  process.exit(1);
}

const files = changedFiles(base);
if (!files) {
  console.log(`[vercel-ignore] ${workspaceName}: could not read changed files, building.`);
  process.exit(1);
}

const relevantFiles = files.filter((file) =>
  watchedPaths.some((watchedPath) => matchesWatchedPath(file, watchedPath)),
);

if (relevantFiles.length === 0) {
  console.log(`[vercel-ignore] ${workspaceName}: no relevant changes since ${base.slice(0, 7)}, skipping build.`);
  process.exit(0);
}

console.log(`[vercel-ignore] ${workspaceName}: relevant changes detected, building.`);
for (const file of relevantFiles.slice(0, 30)) {
  console.log(`- ${relative(repoRoot, resolve(repoRoot, file))}`);
}
if (relevantFiles.length > 30) {
  console.log(`...and ${relevantFiles.length - 30} more`);
}
process.exit(1);
