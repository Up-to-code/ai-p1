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
  const parentNextDir = path.resolve(process.cwd(), "..", ".next");

  await mkdir(parentNextDir, { recursive: true });
  await copyFile(source, path.join(parentNextDir, "routes-manifest.json"));
  await copyFile(target, path.join(parentNextDir, "routes-manifest-deterministic.json"));
  console.log("Ensured parent .next routes manifests for Vercel deployment.");
}
