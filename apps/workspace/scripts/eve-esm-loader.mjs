const nextBareSpecifiers = [
  "next/server",
  "next/headers",
  "next/navigation",
  "next/dynamic",
  "next/router",
  "next/compat/router",
  "next/script",
];

const nextPackageJsonUrl = "/next/package.json";

export async function resolve(specifier, context, nextResolve) {
  if (nextBareSpecifiers.includes(specifier)) {
    return nextResolve(specifier + ".js", context);
  }

  const parentUrl = context.parentURL || "";
  const isClerk = parentUrl.includes("/@clerk/");
  if (
    isClerk &&
    (specifier.startsWith("./") || specifier.startsWith("../")) &&
    !/\.(js|mjs|cjs|json|node)$/.test(specifier)
  ) {
    try {
      return await nextResolve(specifier + ".js", context);
    } catch {
      return await nextResolve(specifier + "/index.js", context);
    }
  }

  return nextResolve(specifier, context);
}

export function load(url, context, nextLoad) {
  if (url.includes(nextPackageJsonUrl)) {
    return nextLoad(url, {
      ...context,
      importAttributes: { ...context.importAttributes, type: "json" },
    });
  }
  return nextLoad(url, context);
}
