import { copyFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";

const nextDir = path.join(process.cwd(), ".next");
const source = path.join(nextDir, "routes-manifest.json");
const target = path.join(nextDir, "routes-manifest-deterministic.json");
const manifestRelativePaths = [
  "routes-manifest.json",
  "routes-manifest-deterministic.json",
  "build-manifest.json",
  "fallback-build-manifest.json",
  "images-manifest.json",
  "prerender-manifest.json",
  "app-path-routes-manifest.json",
  "server/app-paths-manifest.json",
  "server/functions-config-manifest.json",
  "server/middleware-manifest.json",
  "server/next-font-manifest.json",
  "server/pages-manifest.json",
  "server/server-reference-manifest.json",
];

async function copyIfExists(fromDir, toDir, relativePath) {
  const from = path.join(fromDir, relativePath);
  const to = path.join(toDir, relativePath);

  try {
    await stat(from);
  } catch {
    return false;
  }

  await mkdir(path.dirname(to), { recursive: true });
  await copyFile(from, to);
  return true;
}

try {
  await stat(source);
} catch (error) {
  throw new Error(
    `Cannot create Vercel routes manifest because ${source} does not exist.`,
    { cause: error },
  );
}

await copyFile(source, target);
console.log("Ensured .next/routes-manifest-deterministic.json for Vercel deployment.");

if (process.env.VERCEL) {
  const vercelCloneRoot = "/vercel/path0";
  let current = process.cwd();
  const copied = new Set([nextDir]);

  while (current.startsWith(`${vercelCloneRoot}/`) && current !== vercelCloneRoot) {
    current = path.dirname(current);
    const ancestorNextDir = path.join(current, ".next");
    if (copied.has(ancestorNextDir)) continue;

    await Promise.all(manifestRelativePaths.map((relativePath) => copyIfExists(nextDir, ancestorNextDir, relativePath)));
    copied.add(ancestorNextDir);
  }

  console.log("Ensured ancestor .next manifests for Vercel deployment.");
}
