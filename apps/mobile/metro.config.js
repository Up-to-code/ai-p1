const fs = require("fs");
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");
const projectNodeModules = path.resolve(projectRoot, "node_modules");
const workspaceNodeModules = path.resolve(workspaceRoot, "node_modules");
const packagesRoot = path.resolve(workspaceRoot, "packages");
const convexRoot = path.resolve(workspaceRoot, "convex");
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

function resolveSingletonPath(moduleName) {
  const packageName = getPackageName(moduleName);
  const packageRoot = resolvePackageRoot(packageName);

  if (packageRoot) {
    if (moduleName === packageName) {
      return packageRoot;
    }

    try {
      return require.resolve(moduleName, {
        paths: [projectRoot, workspaceRoot, path.dirname(packageRoot)],
      });
    } catch {
      return path.join(packageRoot, moduleName.slice(packageName.length + 1));
    }
  }

  return require.resolve(moduleName, {
    paths: [projectRoot, workspaceRoot],
  });
}

config.watchFolders = [...new Set([...(config.watchFolders ?? []), packagesRoot, convexRoot])];
config.resolver.alias = {
  ...(config.resolver.alias ?? {}),
  "@": path.resolve(projectRoot, "src"),
  "@convex": path.resolve(workspaceRoot, "convex"),
  "@zayon/assistant-protocol": path.resolve(workspaceRoot, "packages/zayon-assistant-protocol/src/index.ts"),
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
    get(_target, packageName) {
      if (typeof packageName !== "string") {
        return undefined;
      }

      return resolvePackageRoot(packageName);
    },
  },
);

const strictSingletons = [
  "react",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
  "react-dom",
  "react-native",
  "convex",
  "convex/react"
];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (strictSingletons.includes(moduleName)) {
    return context.resolveRequest(
      context,
      resolveSingletonPath(moduleName),
      platform
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, {
  input: "./global.css",
});
