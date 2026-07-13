import { fileURLToPath } from "node:url";

const fromRoot = (path) => fileURLToPath(new URL(path, import.meta.url));

export const workspaceAliases = [
  { find: "@qentrah/brand-identity", replacement: fromRoot("./packages/brand-identity/src/index.ts") },
  { find: "@qentrah/partner-auth-core", replacement: fromRoot("./packages/partner-auth-core/src/index.ts") },
  { find: "@qentrah/partner-workspace-sync", replacement: fromRoot("./packages/partner-workspace-sync/src/index.ts") },
  { find: "@qentrah/auth/client", replacement: fromRoot("./packages/auth/src/client/index.ts") },
  { find: "@qentrah/auth/config", replacement: fromRoot("./packages/auth/src/config/index.ts") },
  { find: "@qentrah/auth/credentials", replacement: fromRoot("./packages/auth/src/credentials/index.ts") },
  { find: "@qentrah/auth/http", replacement: fromRoot("./packages/auth/src/http/index.ts") },
  { find: "@qentrah/auth/react", replacement: fromRoot("./packages/auth/src/react/index.ts") },
  { find: "@qentrah/auth/resource-server", replacement: fromRoot("./packages/auth/src/resource-server/index.ts") },
  { find: "@qentrah/auth/scopes", replacement: fromRoot("./packages/auth/src/scopes/index.ts") },
  { find: "@qentrah/auth/server", replacement: fromRoot("./packages/auth/src/server/index.ts") },
  { find: "@qentrah/auth", replacement: fromRoot("./packages/auth/src/index.ts") },
  { find: "@qentrah/platform-core/auth-next", replacement: fromRoot("./packages/platform-core/src/auth-next.ts") },
  { find: "@qentrah/platform-core/classnames", replacement: fromRoot("./packages/platform-core/src/classnames.ts") },
  { find: "@qentrah/platform-core/effect-api", replacement: fromRoot("./packages/platform-core/src/effect-api.ts") },
  { find: "@qentrah/platform-core/errors", replacement: fromRoot("./packages/platform-core/src/errors.ts") },
  { find: "@qentrah/platform-core/locale", replacement: fromRoot("./packages/platform-core/src/locale.ts") },
  { find: "@qentrah/platform-core/session", replacement: fromRoot("./packages/platform-core/src/session.ts") },
  { find: "@qentrah/platform-core", replacement: fromRoot("./packages/platform-core/src/index.ts") },
  { find: "@qentrah/domain-contracts/subscription-pricing", replacement: fromRoot("./packages/domain-contracts/src/subscriptionPricing.ts") },
  { find: /^@qentrah\/domain-contracts\/(.+)$/, replacement: fromRoot("./packages/domain-contracts/src/$1.ts") },
  { find: "@qentrah/domain-contracts", replacement: fromRoot("./packages/domain-contracts/src/index.ts") },
  { find: /^@qentrah\/our-platform-components\/(pipeline|widget-grid)$/, replacement: fromRoot("./packages/our-platform-components/src/$1/index.ts") },
  { find: "@qentrah/our-platform-components", replacement: fromRoot("./packages/our-platform-components/src/index.ts") },
];
