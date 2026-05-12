import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const requiredModules = [
  "lucide-react",
  "fumadocs-ui/provider/next",
  "fumadocs-ui/style.css",
  "next",
  "react",
  "react-dom",
  "next-themes",
];

export function checkDevDependencies(options = {}) {
  const paths = options.paths ?? [process.cwd()];
  const missing = requiredModules.filter((name) => {
    try {
      require.resolve(name, { paths });
      return false;
    } catch {
      return true;
    }
  });

  return {
    ok: missing.length === 0,
    missing,
  };
}

export function assertDevDependencies(options = {}) {
  const result = checkDevDependencies(options);
  if (result.ok) return;

  throw new Error(
    [
      `Missing Partners dependencies: ${result.missing.join(", ")}`,
      "Install dependencies from the workspace root with:",
      "  npm install",
      "Then restart the Partners dev server.",
    ].join("\n"),
  );
}
