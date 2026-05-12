import { fileURLToPath } from "node:url";

const fromRoot = (path) => fileURLToPath(new URL(path, import.meta.url));

export const workspaceAliases = [
  { find: "@anan/auth/client", replacement: fromRoot("./packages/auth/src/client/index.ts") },
  { find: "@anan/auth/react", replacement: fromRoot("./packages/auth/src/react/index.ts") },
  { find: "@anan/auth/resource-server", replacement: fromRoot("./packages/auth/src/resource-server/index.ts") },
  { find: "@anan/auth/scopes", replacement: fromRoot("./packages/auth/src/scopes/index.ts") },
  { find: "@anan/auth/server", replacement: fromRoot("./packages/auth/src/server/index.ts") },
  { find: "@anan/auth", replacement: fromRoot("./packages/auth/src/index.ts") },
  { find: "@anan/authorization", replacement: fromRoot("./packages/authorization/src/index.ts") },
  { find: "@anan/platform-core/auth-next", replacement: fromRoot("./packages/platform-core/src/auth-next.ts") },
  { find: "@anan/platform-core/classnames", replacement: fromRoot("./packages/platform-core/src/classnames.ts") },
  { find: "@anan/platform-core/convex-api", replacement: fromRoot("./packages/platform-core/src/convex-api.ts") },
  { find: "@anan/platform-core/errors", replacement: fromRoot("./packages/platform-core/src/errors.ts") },
  { find: "@anan/platform-core/locale", replacement: fromRoot("./packages/platform-core/src/locale.ts") },
  { find: "@anan/platform-core/session", replacement: fromRoot("./packages/platform-core/src/session.ts") },
  { find: "@anan/platform-core", replacement: fromRoot("./packages/platform-core/src/index.ts") },
  { find: /^@anan\/domain-contracts\/(.+)$/, replacement: fromRoot("./packages/domain-contracts/src/$1.ts") },
  { find: "@anan/domain-contracts", replacement: fromRoot("./packages/domain-contracts/src/index.ts") },
  { find: /^@anan\/web-foundation\/(.+)$/, replacement: fromRoot("./packages/web-foundation/src/$1.ts") },
  { find: "@anan/web-foundation", replacement: fromRoot("./packages/web-foundation/src/index.ts") },
];
