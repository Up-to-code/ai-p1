import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const forbiddenLocalConvexUrl = "http://127.0.0.1:3210";
const devRoots = [
  path.join(projectRoot, ".next", "dev", "static"),
  path.join(projectRoot, ".next", "dev", "server"),
];
const productionRoots = [
  path.join(projectRoot, ".next", "static"),
  path.join(projectRoot, ".next", "server"),
];

async function exists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

async function* walk(root) {
  const entries = await readdir(root, { withFileTypes: true });

  for (const entry of entries) {
    const target = path.join(root, entry.name);

    if (entry.isDirectory()) {
      yield* walk(target);
      continue;
    }

    if (entry.isFile() && !entry.name.endsWith(".map")) {
      yield target;
    }
  }
}

const devRootsAvailable = await Promise.all(devRoots.map(exists));
const scanRoots = devRootsAvailable.some(Boolean) ? devRoots : productionRoots;
const roots = [];

for (const root of scanRoots) {
  if (await exists(root)) roots.push(root);
}

if (roots.length === 0) {
  console.warn("No .next runtime chunks found. Run Next dev/build before this check.");
  process.exit(0);
}

const matches = [];
let scannedFiles = 0;

for (const root of roots) {
  for await (const filePath of walk(root)) {
    scannedFiles += 1;
    const content = await readFile(filePath, "utf8").catch(() => "");

    if (content.includes(forbiddenLocalConvexUrl)) {
      matches.push(path.relative(projectRoot, filePath));
    }
  }
}

if (matches.length > 0) {
  console.error(`Found forbidden local Convex fallback ${forbiddenLocalConvexUrl} in built runtime chunks:`);
  for (const match of matches) {
    console.error(`- ${match}`);
  }
  process.exit(1);
}

console.log(`Convex runtime check passed across ${scannedFiles} non-map chunk(s).`);
