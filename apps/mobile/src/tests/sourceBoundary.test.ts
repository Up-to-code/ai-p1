import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const appRoot = path.resolve(__dirname, "../../app");
const srcRoot = path.resolve(__dirname, "..");
const skippedDirs = new Set(["tests"]);
const checkedExtensions = new Set([".js", ".jsx", ".ts", ".tsx"]);

function listSourceFiles(root: string): string[] {
  const rows: string[] = [];
  for (const entry of readdirSync(root)) {
    const fullPath = path.join(root, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (!skippedDirs.has(entry)) rows.push(...listSourceFiles(fullPath));
      continue;
    }
    if (checkedExtensions.has(path.extname(entry))) {
      rows.push(fullPath);
    }
  }
  return rows;
}

test("mobile source stays behind the Workspace API boundary", () => {
  const dbVendor = "con" + "vex";
  const banned = [dbVendor, dbVendor[0].toUpperCase() + dbVendor.slice(1), "@" + dbVendor];
  const matches = [...listSourceFiles(appRoot), ...listSourceFiles(srcRoot)]
    .flatMap((filePath) => {
      const source = readFileSync(filePath, "utf8");
      return banned.some((term) => source.includes(term))
        ? [path.relative(path.resolve(__dirname, "../../.."), filePath)]
        : [];
    });

  assert.deepEqual(matches, []);
});

test("workspace chooser does not expose manual invite entry UI", () => {
  const source = readFileSync(path.resolve(appRoot, "(auth)/choose-workspace.tsx"), "utf8");

  assert.equal(source.includes("workspace.join"), false);
  assert.equal(source.includes("invite_input"), false);
  assert.equal(source.includes("parseInviteInput"), false);
});
