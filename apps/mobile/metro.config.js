const fs = require("fs");
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");
const projectNodeModules = path.resolve(projectRoot, "node_modules");
const workspaceNodeModules = path.resolve(workspaceRoot, "node_modules");
const packagesRoot = path.resolve(workspaceRoot, "packages");
const bunStoreRoot = path.resolve(workspaceRoot, "node_modules/.bun");
const bunPackageCache = new Map();

const config = getDefaultConfig(projectRoot);

function findBunPackageRoot(packageName) {
  if (bunPackageCache.has(packageName)) {
    return bunPackageCache.get(packageName);
  }

  const escapedName = packageName.replaceAll("/", "+");
  let resolved = null;

  try {
    const matches = fs
      .readdirSync(bunStoreRoot)
      .filter((entry) => entry.startsWith(`${escapedName}@`))
      .sort()
      .reverse();

    for (const match of matches) {
      const candidate = path.join(bunStoreRoot, match, "node_modules", packageName);
      if (fs.existsSync(candidate)) {
        resolved = candidate;
        break;
      }
    }
  } catch {
    resolved = null;
  }

  bunPackageCache.set(packageName, resolved);
  return resolved;
}

function getPackageName(moduleName) {
  if (moduleName.startsWith("@")) {
    const [scope, name] = moduleName.split("/");
    return name ? `${scope}/${name}` : moduleName;
  }

  return moduleName.split("/")[0];
}

function resolvePackageRoot(packageName) {
  const projectCandidate = path.resolve(projectNodeModules, packageName);
  if (fs.existsSync(projectCandidate)) {
    return projectCandidate;
  }

  const workspaceCandidate = path.resolve(workspaceNodeModules, packageName);
  if (fs.existsSync(workspaceCandidate)) {
    return workspaceCandidate;
  }

  return findBunPackageRoot(packageName) ?? undefined;
}

function resolveProjectPackageRoot(packageName) {
  const projectCandidate = path.resolve(projectNodeModules, packageName);
  return fs.existsSync(projectCandidate) ? projectCandidate : undefined;
}

function resolveSingletonPath(moduleName) {
  const packageName = getPackageName(moduleName);
  const packageRoot = ["react", "react-dom", "react-native", "scheduler"].includes(packageName)
    ? resolveProjectPackageRoot(packageName) ?? resolvePackageRoot(packageName)
    : resolvePackageRoot(packageName);

  if (packageRoot) {
    if (moduleName === packageName) {
      const pkgJsonPath = path.join(packageRoot, "package.json");
      const main = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8")).main ?? "index.js";
      const resolvedPath = path.join(packageRoot, main);
      if (fs.existsSync(resolvedPath)) return resolvedPath;
      for (const ext of [".js", ".jsx", ".ts", ".tsx", ".json"]) {
        const withExt = resolvedPath + ext;
        if (fs.existsSync(withExt)) return withExt;
      }
      return resolvedPath;
    }

    try {
      return require.resolve(moduleName, {
        paths: [projectRoot, path.dirname(packageRoot)],
      });
    } catch {
      return path.join(packageRoot, moduleName.slice(packageName.length + 1));
    }
  }

  return require.resolve(moduleName, {
    paths: [projectRoot, workspaceRoot],
  });
}

config.watchFolders = [
  ...new Set(
    [...(config.watchFolders ?? []), packagesRoot].filter((folder) =>
      fs.existsSync(folder)
    ),
  ),
];
config.resolver.alias = {
  ...(config.resolver.alias ?? {}),
  "@": path.resolve(projectRoot, "src"),
  react: resolveSingletonPath("react"),
  "react/jsx-runtime": resolveSingletonPath("react/jsx-runtime"),
  "react/jsx-dev-runtime": resolveSingletonPath("react/jsx-dev-runtime"),
  "react-dom": resolveSingletonPath("react-dom"),
  "react-native": resolveSingletonPath("react-native"),
  scheduler: resolveSingletonPath("scheduler"),
};
config.resolver.extraNodeModules = new Proxy(
  {},
  {
    has(_target, packageName) {
      if (typeof packageName !== "string") return false;
      return resolvePackageRoot(packageName) != null;
    },
    get(_target, packageName) {
      if (typeof packageName !== "string") return undefined;
      return resolvePackageRoot(packageName);
    },
    ownKeys() {
      return [];
    },
  },
);

const strictSingletons = [
  "react",
  "react-dom",
  "react-native",
  "react-native-reanimated",
  "react-native-screens"
];

const fallbackMainFieldCache = new Map();

function fallbackMainField(packageName) {
  if (fallbackMainFieldCache.has(packageName)) return fallbackMainFieldCache.get(packageName);
  const pkgRoot = resolvePackageRoot(packageName);
  if (!pkgRoot) { fallbackMainFieldCache.set(packageName, null); return null; }
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(pkgRoot, "package.json"), "utf8"));
    if (!pkg["react-native"] || !pkg.main) { fallbackMainFieldCache.set(packageName, null); return null; }
    const rnPath = path.join(pkgRoot, pkg["react-native"]);
    const mainPath = path.join(pkgRoot, pkg.main);
    const canResolve = [".js", ".jsx", ".ts", ".tsx", ".json", ".cjs", ".mjs"].some(
      e => fs.existsSync(rnPath + e) || fs.existsSync(rnPath) || fs.existsSync(rnPath + "/index.js")
    );
    if (canResolve) { fallbackMainFieldCache.set(packageName, null); return null; }
    for (const ext of [".js", ".cjs", ".mjs", ".jsx", ".ts", ".tsx"]) {
      if (fs.existsSync(mainPath + ext)) { const r = path.resolve(mainPath + ext); fallbackMainFieldCache.set(packageName, r); return r; }
    }
    if (fs.existsSync(mainPath)) { const r = path.resolve(mainPath); fallbackMainFieldCache.set(packageName, r); return r; }
    fallbackMainFieldCache.set(packageName, null);
    return null;
  } catch { fallbackMainFieldCache.set(packageName, null); return null; }
}

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (strictSingletons.some((singleton) => moduleName === singleton || moduleName.startsWith(`${singleton}/`))) {
    const filePath = resolveSingletonPath(moduleName);
    if (filePath && fs.existsSync(filePath)) {
      return { type: "sourceFile", filePath };
    }
  }
  const packageName = getPackageName(moduleName);
  if (moduleName === packageName) {
    const fallback = fallbackMainField(packageName);
    if (fallback && fs.existsSync(fallback)) {
      return { type: "sourceFile", filePath: fallback };
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
