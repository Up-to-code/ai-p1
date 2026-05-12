import { rmSync } from "node:fs";
import { join } from "node:path";

const devCachePaths = [
  join(".next", "dev", "cache", "turbopack"),
  join(".next", "cache"),
];

export function clearNextDevCaches(packageDir = process.cwd()) {
  for (const relativePath of devCachePaths) {
    rmSync(join(packageDir, relativePath), {
      force: true,
      recursive: true,
    });
  }
}
