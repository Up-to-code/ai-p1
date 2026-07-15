import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const lock = JSON.parse(fs.readFileSync(path.join(root, "package-lock.json"), "utf8"));
const exceptions = JSON.parse(fs.readFileSync(path.join(root, "config/dependency-license-exceptions.json"), "utf8"));
const allowed = new Set(["MIT", "Apache-2.0", "ISC", "BSD-2-Clause", "BSD-3-Clause", "0BSD"]);
const hardDenied = /\b(AGPL|SSPL|BUSL)(?:-|\b)/i;

function permittedExpression(license) {
  if (allowed.has(license)) return true;
  if (license.includes(" OR ")) return license.replace(/[()]/g, "").split(" OR ").some((part) => permittedExpression(part.trim()));
  if (license.includes(" AND ")) return license.replace(/[()]/g, "").split(" AND ").every((part) => allowed.has(part.trim()));
  return false;
}

const packages = Object.entries(lock.packages ?? {}).filter(([key]) => key.includes("node_modules/")).map(([key, value]) => ({
  name: key.split("node_modules/").at(-1), version: value.version ?? "unknown", license: value.license ?? "UNKNOWN", path: key,
})).sort((a, b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version));

const violations = [], recordedExceptions = [], unknown = [];
for (const item of packages) {
  if (hardDenied.test(item.license)) violations.push(item);
  else if (permittedExpression(item.license)) continue;
  else if (exceptions[item.license]) recordedExceptions.push({ ...item, review: exceptions[item.license] });
  else if (item.license === "UNKNOWN") unknown.push(item);
  else violations.push(item);
}

const inventory = { generatedFrom: "package-lock.json", packageCount: packages.length, allowedLicenses: [...allowed], recordedExceptionCount: recordedExceptions.length, unknownCount: unknown.length, violationCount: violations.length, recordedExceptions, unknown, violations };
const sbom = { spdxVersion: "SPDX-2.3", dataLicense: "CC0-1.0", SPDXID: "SPDXRef-DOCUMENT", name: "Qentrah dependency SBOM", documentNamespace: `https://qentrah.com/sbom/${lock.lockfileVersion ?? 0}`, creationInfo: { creators: ["Tool: scripts/check-dependency-licenses.mjs"] }, packages: packages.map((item, index) => ({ SPDXID: `SPDXRef-Package-${index + 1}`, name: item.name, versionInfo: item.version, licenseConcluded: item.license, licenseDeclared: item.license, downloadLocation: "NOASSERTION", filesAnalyzed: false })) };
const outputs = [["docs/compliance/dependency-license-inventory.json", inventory], ["docs/compliance/sbom.spdx.json", sbom]];
if (process.argv.includes("--check")) {
  for (const [file, value] of outputs) if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== `${JSON.stringify(value, null, 2)}\n`) violations.push({ name: file, version: "generated", license: "STALE" });
} else {
  fs.mkdirSync(path.join(root, "docs/compliance"), { recursive: true });
  for (const [file, value] of outputs) fs.writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`);
}
if (unknown.length) console.warn(`License inventory contains ${unknown.length} packages without lockfile license metadata; they remain listed for review.`);
if (violations.length) { console.error("Dependency license policy violations:"); for (const item of violations) console.error(`- ${item.name}@${item.version}: ${item.license}`); process.exit(1); }
console.log(`License policy passed for ${packages.length} packages (${recordedExceptions.length} recorded exceptions, ${unknown.length} unknown metadata entries).`);
