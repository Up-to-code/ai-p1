import { copyFile, stat } from "node:fs/promises";
import path from "node:path";

const nextDir = path.join(process.cwd(), ".next");
const source = path.join(nextDir, "routes-manifest.json");
const target = path.join(nextDir, "routes-manifest-deterministic.json");

try {
  await stat(target);
} catch {
  await stat(source);
  await copyFile(source, target);
  console.log("Created .next/routes-manifest-deterministic.json for Vercel deployment.");
}
