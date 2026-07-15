# Qentrah

Qentrah is an AI-native client operations platform for agencies and professional services firms. The monorepo is intentionally limited to the product surfaces that support that business.

> **Source-available licensing:** Qentrah 0.1.0 is licensed under the Business
> Source License 1.1. It is not Open Source until its Change Date. Non-production
> use and the production uses in the Additional Use Grant are permitted; other
> production use requires a commercial license.

## Applications

| Path | Package | Responsibility |
| --- | --- | --- |
| `apps/workspace` | `@qentrah/workspace` | Main web and desktop workspace, Convex backend, MCP adapters, and Eve agents |
| `apps/marketing` | `@qentrah/marketing` | Public, localized marketing website with repository-owned content |
| `apps/zapier` | `@qentrah/zapier-app` | Zapier integration |
| `apps/mobile` | `@qentrah/mobile` | Expo mobile application |
| `apps/partners` | — | Neutral partner-facing static assets; partner runtime behavior is owned by Workspace and partner packages |

Shared code under `packages/` is retained only when one or more of these applications consumes it. Legacy admin, demo, and standalone CMS applications are not part of the repository.

## Repository map

```text
qentrah/
├── apps/                       # Deployable product surfaces
├── packages/                   # Shared contracts, policy, UI, and runtime modules
├── docs/                       # Current architecture, decisions, and lifecycle documentation
├── scripts/                    # Repository build and documentation utilities
├── AGENTS.md                   # Agent operating instructions
├── CONTEXT.md                  # Domain language and deepened modules
└── component-registry.json     # Shared rendered UI registry
```

The authoritative architecture references are:

- `CONTEXT.md` for domain language.
- `docs/architecture/qentrah-module-map.md` for ownership and intended seams.
- `docs/architecture/qentrah-codebase-interface-map.md` for generated public interfaces.
- `docs/architecture/qentrah-agent-execution-roadmap.md` for remaining implementation packets.
- `docs/decisions/` for accepted decisions.
- `docs/lifecycles/` for connected flow documentation.

## Development

Install dependencies with npm:

```bash
npm install
```

Run an application from the repository root:

```bash
npm run dev:ws
npm run dev:marketing
npm run dev:zapier
npm run dev:mobile
```

The retained `apps/partners` directory is not currently an executable npm workspace.

## Verification

```bash
npm run typecheck
npm run test
npm run licenses:check
npm run licenses:project:check
npm run docs:codebase-map:check
```

Workspace-specific checks:

```bash
npm --workspace @qentrah/workspace run typecheck
npm --workspace @qentrah/workspace run check:convex-runtime
```

## Core platform choices

- Next.js and React for web surfaces.
- Convex for reactive server-owned data.
- Better Auth for identity and Organization membership.
- Dodo Payments for billing.
- IndexedDB for drafts and client-only configuration.
- npm workspaces for monorepo dependency management.

## License

Qentrah source code and non-brand documentation are licensed under the
[Business Source License 1.1](LICENSE). The first release changes to
Apache-2.0 on 15 July 2030.

Production use by an affiliated group with USD 1,000,000 or more in annual
gross revenue requires a separately negotiated commercial license unless a
different permitted-purpose condition applies. See
[commercial licensing](COMMERCIAL-LICENSE.md).

Qentrah trademarks and protected artwork are not included in the BSL grant.
See the [trademark policy](TRADEMARKS.md).

## Repository policies

- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Source-available readiness](docs/compliance/open-source-readiness.md)

The repository remains private until legal counsel approves the license,
contributor agreements, asset boundary, and publication gates.
