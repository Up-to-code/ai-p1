import { copyFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";

const nextDir = path.join(process.cwd(), ".next");
const source = path.join(nextDir, "routes-manifest.json");
const target = path.join(nextDir, "routes-manifest-deterministic.json");

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

    await mkdir(ancestorNextDir, { recursive: true });
    await copyFile(source, path.join(ancestorNextDir, "routes-manifest.json"));
    await copyFile(target, path.join(ancestorNextDir, "routes-manifest-deterministic.json"));
    copied.add(ancestorNextDir);
  }

  console.log("Ensured ancestor .next routes manifests for Vercel deployment.");
}
