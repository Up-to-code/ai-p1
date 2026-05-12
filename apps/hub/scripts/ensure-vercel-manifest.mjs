import { copyFile, mkdir, readlink, readdir, rm, stat, symlink } from "node:fs/promises";
import path from "node:path";

const nextDir = path.join(process.cwd(), ".next");
const nodeModulesDir = path.join(process.cwd(), "node_modules");
const source = path.join(nextDir, "routes-manifest.json");
const target = path.join(nextDir, "routes-manifest-deterministic.json");

async function mirrorNextOutput(fromDir, toDir) {
  await mkdir(toDir, { recursive: true });

  const entries = await readdir(fromDir, { withFileTypes: true });
  await Promise.all(entries.map(async (entry) => {
    if (entry.name === "cache") return;

    const from = path.join(fromDir, entry.name);
    const to = path.join(toDir, entry.name);

    if (entry.isDirectory()) {
      await mirrorNextOutput(from, to);
      return;
    }

    if (entry.isFile()) {
      await copyFile(from, to);
      return;
    }

    if (entry.isSymbolicLink()) {
      await rm(to, { force: true, recursive: true });
      await symlink(await readlink(from), to);
    }
  }));
}

async function ensureNodeModulesLink(toDir) {
  const targetPath = path.join(toDir, "node_modules");

  try {
    await stat(targetPath);
    return;
  } catch {
    // The Vercel finalizer resolves traced "../node_modules" entries from
    // ancestor .next mirrors. A symlink keeps that lookup valid without copying
    // the dependency tree.
  }

  await symlink(nodeModulesDir, targetPath, "dir");
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

    await mirrorNextOutput(nextDir, ancestorNextDir);
    await ensureNodeModulesLink(current);
    copied.add(ancestorNextDir);
  }

  console.log("Mirrored ancestor .next output for Vercel deployment.");
}
