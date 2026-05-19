import fs from "node:fs";
import path from "node:path";
import { MOBILE_CODE_LINE_LIMIT, isMobileSizeIgnored, mobileSizeInclude } from "./mobile-size-config.cjs";

const cwd = process.cwd();
const includeRoots = mobileSizeInclude.map((pattern) => pattern.split("/**")[0]);
const violations = [];

for (const root of includeRoots) walk(path.join(cwd, root));

if (!violations.length) {
  console.log(`All in-scope mobile files are within ${MOBILE_CODE_LINE_LIMIT} lines.`);
  process.exit(0);
}

const grouped = new Map();
for (const item of violations.sort((a, b) => b.lines - a.lines || a.file.localeCompare(b.file))) {
  const key = item.file.startsWith("app/") ? `app/${item.file.split("/")[1] ?? ""}` : item.file.split("/").slice(0, 2).join("/");
  grouped.set(key, [...(grouped.get(key) ?? []), item]);
}

console.log(`Found ${violations.length} mobile size violations over ${MOBILE_CODE_LINE_LIMIT} lines:\n`);
for (const [group, items] of grouped) {
  console.log(`${group} (${items.length})`);
  for (const item of items) console.log(`  ${item.lines}\t${item.file}`);
  console.log("");
}
process.exit(1);

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) maybeCollect(full);
  }
}

function maybeCollect(full) {
  const rel = path.relative(cwd, full).replaceAll(path.sep, "/");
  if (isMobileSizeIgnored(rel)) return;
  const lines = fs.readFileSync(full, "utf8").split("\n").length;
  if (lines > MOBILE_CODE_LINE_LIMIT) violations.push({ file: rel, lines });
}
