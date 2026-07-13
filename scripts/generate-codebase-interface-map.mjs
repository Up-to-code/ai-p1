import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = join(root, "docs/architecture/qentrah-codebase-interface-map.md");
const sourceRoots = [join(root, "apps"), join(root, "packages")];
const ignoredDirectories = new Set([
  ".next",
  ".turbo",
  "build",
  "coverage",
  "dist",
  "generated",
  "node_modules",
  "public",
]);
const sourceExtensions = new Set([".ts", ".tsx", ".mts", ".cts"]);

function toPosix(path) {
  return path.split(sep).join("/");
}

function walk(directory, predicate = () => true) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        if (entry.name.startsWith(".") || ignoredDirectories.has(entry.name) || entry.name === "_generated") return [];
        return walk(path, predicate);
      }
      return predicate(path) ? [path] : [];
    });
}

function existingSourceRoots(parent, candidates) {
  if (!existsSync(parent)) return [];
  return readdirSync(parent, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => candidates.map((candidate) => join(parent, entry.name, candidate)))
    .filter(existsSync);
}

function isSourceFile(path) {
  const extension = path.slice(path.lastIndexOf("."));
  return sourceExtensions.has(extension) &&
    !/\.(test|spec|stories)\.[cm]?[jt]sx?$/.test(path);
}

function hasExport(node) {
  return node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false;
}

function hasDefault(node) {
  return node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword) ?? false;
}

function declarationName(node) {
  return node.name && ts.isIdentifier(node.name) ? node.name.text : hasDefault(node) ? "default" : null;
}

function callableKind(initializer) {
  if (!initializer || !ts.isCallExpression(initializer)) return null;
  const expression = initializer.expression;
  const name = ts.isIdentifier(expression)
    ? expression.text
    : ts.isPropertyAccessExpression(expression)
      ? expression.name.text
      : null;
  const callableKinds = new Set([
    "action",
    "httpAction",
    "internalAction",
    "internalMutation",
    "internalQuery",
    "mutation",
    "query",
  ]);
  return name && callableKinds.has(name) ? name : null;
}

function exportedInterfaces(path) {
  const sourceText = readFileSync(path, "utf8");
  const source = ts.createSourceFile(
    path,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    path.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const exports = [];
  const convex = [];
  const endpoints = [];

  for (const statement of source.statements) {
    if (hasExport(statement)) {
      if (ts.isFunctionDeclaration(statement)) {
        const name = declarationName(statement);
        if (name) exports.push({ kind: "function", name });
      } else if (ts.isClassDeclaration(statement)) {
        const name = declarationName(statement);
        if (name) exports.push({ kind: "class", name });
      } else if (ts.isInterfaceDeclaration(statement)) {
        exports.push({ kind: "interface", name: statement.name.text });
      } else if (ts.isTypeAliasDeclaration(statement)) {
        exports.push({ kind: "type", name: statement.name.text });
      } else if (ts.isEnumDeclaration(statement)) {
        exports.push({ kind: "enum", name: statement.name.text });
      } else if (ts.isVariableStatement(statement)) {
        for (const declaration of statement.declarationList.declarations) {
          if (!ts.isIdentifier(declaration.name)) continue;
          const kind = callableKind(declaration.initializer);
          exports.push({ kind: kind ? `convex-${kind}` : "value", name: declaration.name.text });
          if (kind) convex.push({ kind, name: declaration.name.text });
        }
      } else if (ts.isExportDeclaration(statement)) {
        const moduleName = statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier)
          ? statement.moduleSpecifier.text
          : "local";
        if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
          for (const element of statement.exportClause.elements) {
            exports.push({ kind: "re-export", name: `${element.name.text} from ${moduleName}` });
          }
        } else {
          exports.push({ kind: "re-export", name: `* from ${moduleName}` });
        }
      }
    }
  }

  function visit(node) {
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      const operation = node.expression.name.text;
      const method = operation === "route" ? "MOUNT" : operation.toUpperCase();
      const supportedMethods = new Set(["all", "delete", "get", "head", "options", "patch", "post", "put", "route"]);
      const firstArgument = node.arguments[0];
      if (
        supportedMethods.has(operation) &&
        firstArgument &&
        ts.isStringLiteralLike(firstArgument) &&
        (firstArgument.text.startsWith("/") || firstArgument.text === "*")
      ) {
        endpoints.push({ method, path: firstArgument.text });
      } else if (operation === "route" && firstArgument && ts.isObjectLiteralExpression(firstArgument)) {
        const pathProperty = firstArgument.properties.find(
          (property) => ts.isPropertyAssignment(property) && property.name.getText(source) === "path",
        );
        const methodProperty = firstArgument.properties.find(
          (property) => ts.isPropertyAssignment(property) && property.name.getText(source) === "method",
        );
        if (
          pathProperty && ts.isPropertyAssignment(pathProperty) && ts.isStringLiteralLike(pathProperty.initializer) &&
          methodProperty && ts.isPropertyAssignment(methodProperty) && ts.isStringLiteralLike(methodProperty.initializer)
        ) {
          endpoints.push({ method: methodProperty.initializer.text, path: pathProperty.initializer.text });
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);

  return { exports, convex, endpoints, sourceText };
}

function packageManifests() {
  const candidates = [join(root, "package.json")];
  for (const base of sourceRoots) {
    if (!existsSync(base)) continue;
    for (const entry of readdirSync(base, { withFileTypes: true })) {
      const manifest = join(base, entry.name, "package.json");
      if (entry.isDirectory() && existsSync(manifest)) candidates.push(manifest);
    }
  }
  return candidates.sort().map((path) => ({ path, manifest: JSON.parse(readFileSync(path, "utf8")) }));
}

function routeFor(path) {
  const normalized = toPosix(relative(root, path));
  const marker = normalized.includes("/src/app/") ? "/src/app/" : normalized.includes("/app/") ? "/app/" : null;
  if (!marker || !/(^|\/)(page|route)\.[cm]?[jt]sx?$/.test(normalized)) return null;
  const [, suffix] = normalized.split(marker);
  const parts = suffix
    .split("/")
    .slice(0, -1)
    .filter((part) => !(part.startsWith("(") && part.endsWith(")")))
    .map((part) => part.replace(/^\[\.\.\.(.+)\]$/, ":$1*").replace(/^\[(.+)\]$/, ":$1"));
  return `/${parts.join("/")}`.replace(/\/$/, "") || "/";
}

function extractToolNames(path, sourceText) {
  const normalized = toPosix(relative(root, path));
  const tools = [];
  if (/apps\/workspace\/agent\/(?:.+\/)?tools\/.+\.[cm]?[jt]s$/.test(normalized)) {
    const match = sourceText.match(/\bname\s*:\s*["'`]([^"'`]+)["'`]/);
    tools.push({ adapter: "Eve", name: match?.[1] ?? normalized.split("/").at(-1).replace(/\.[^.]+$/, "") });
  }
  if (normalized === "packages/mcp-contracts/src/tool-catalog.ts") {
    for (const match of sourceText.matchAll(/\bname\s*:\s*["'`]([^"'`]+)["'`]/g)) {
      tools.push({ adapter: "MCP", name: match[1] });
    }
  }
  return tools;
}

const inventoryRoots = [
  ...existingSourceRoots(join(root, "apps"), ["src", "app", "agent", "convex"]),
  ...existingSourceRoots(join(root, "packages"), ["src"]),
];
const files = inventoryRoots.flatMap((directory) => walk(directory, isSourceFile)).sort();
const interfaceRows = [];
const convexRows = [];
const toolRows = [];
const routeRows = [];
const endpointRows = [];

for (const path of files) {
  const file = toPosix(relative(root, path));
  const parsed = exportedInterfaces(path);
  if (parsed.exports.length) {
    interfaceRows.push({
      file,
      symbols: parsed.exports.map((entry) => `${entry.kind}: ${entry.name}`).join("<br>"),
    });
  }
  for (const callable of parsed.convex) convexRows.push({ ...callable, file });
  for (const endpoint of parsed.endpoints) endpointRows.push({ ...endpoint, file });
  for (const tool of extractToolNames(path, parsed.sourceText)) toolRows.push({ ...tool, file });
  const route = routeFor(path);
  if (route) routeRows.push({ route, kind: /\/route\./.test(file) ? "handler" : "page", file });
}

const commandRows = packageManifests().flatMap(({ path, manifest }) =>
  Object.entries(manifest.scripts ?? {}).map(([name, command]) => ({
    package: manifest.name ?? (toPosix(relative(root, dirname(path))) || "root"),
    name,
    command,
  })),
);

function escapeCell(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}

function table(headers, rows) {
  if (!rows.length) return "_None discovered._\n";
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(escapeCell).join(" | ")} |`),
    "",
  ].join("\n");
}

const markdown = `# Qentrah Codebase Interface and Command Map

> Generated by \`npm run docs:codebase-map\`. Do not edit this file by hand.
> Domain ownership and intended seams remain authoritative in
> [qentrah-module-map.md](./qentrah-module-map.md).

## Inventory summary

- Source files scanned: ${files.length}
- Files exposing interfaces: ${interfaceRows.length}
- Convex registered functions: ${convexRows.length}
- Application routes: ${routeRows.length}
- Hono/Convex HTTP registrations: ${endpointRows.length}
- Eve/MCP tool entries: ${toolRows.length}
- Package commands: ${commandRows.length}

## Package commands

${table(["Package", "Command", "Implementation"], commandRows.map((row) => [row.package, row.name, `\`${row.command}\``]))}
## Application routes

${table(["Route", "Kind", "Source"], routeRows.sort((a, b) => a.route.localeCompare(b.route)).map((row) => [`\`${row.route}\``, row.kind, `\`${row.file}\``]))}
## Hono and Convex HTTP registrations

Paths are shown as registered in their owning router. \`MOUNT\` rows compose child
routers under the listed prefix; executable source remains authoritative for the
fully composed path.

${table(["Method", "Registered path", "Source"], endpointRows.sort((a, b) => a.file.localeCompare(b.file) || a.path.localeCompare(b.path)).map((row) => [row.method, `\`${row.path}\``, `\`${row.file}\``]))}
## Convex functions

${table(["Exposure", "Export", "Source"], convexRows.sort((a, b) => a.file.localeCompare(b.file) || a.name.localeCompare(b.name)).map((row) => [row.kind, `\`${row.name}\``, `\`${row.file}\``]))}
## Eve and MCP tools

${table(["Adapter", "Tool", "Source"], toolRows.sort((a, b) => a.adapter.localeCompare(b.adapter) || a.name.localeCompare(b.name)).map((row) => [row.adapter, `\`${row.name}\``, `\`${row.file}\``]))}
## Exported interfaces by file

This inventory includes exported functions, classes, types, interfaces, values,
Convex registrations, and re-exports. Private implementation details are
intentionally excluded; callers should depend on public interfaces.

${table(["Source", "Exported interface"], interfaceRows.map((row) => [`\`${row.file}\``, row.symbols]))}`;

const current = existsSync(outputPath) ? readFileSync(outputPath, "utf8") : null;
if (process.argv.includes("--check")) {
  if (current !== markdown) {
    console.error("Codebase interface map is stale. Run `npm run docs:codebase-map`.");
    process.exit(1);
  }
  console.log("Codebase interface map is current.");
} else if (current === markdown) {
  console.log("Codebase interface map is already current.");
} else {
  writeFileSync(outputPath, markdown);
  console.log(`Wrote ${toPosix(relative(root, outputPath))}`);
}
