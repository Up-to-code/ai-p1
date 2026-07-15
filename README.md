<p align="center">
  <img src="packages/brand-identity/assets/source/brand-logo.svg" alt="Qentrah" width="280" />
</p>

<p align="center">
  <strong>The AI-native operating system for agencies and professional services teams.</strong>
</p>

<p align="center">
  Connect clients, sales, delivery, collaboration, finance, and AI-assisted execution in one organization-owned workspace.
</p>

# Qentrah

Qentrah helps agencies run the complete client lifecycle without splitting context across separate CRM, project-management, communication, and finance systems. A lead can become a deal, contract, engagement, delivery project, approval, invoice, and profitability record while each domain remains authoritative and auditable.

The product is an active `v0.1.0` pre-release. This repository is private while its source-available publication packet completes legal, security, provenance, and engineering review.

## What Qentrah includes

- **Client operations:** clients, contacts, companies, leads, deals, proposals, contracts, and pipeline workflows.
- **Project delivery:** Spaces, Projects, Tasks, Documents, calendars, saved views, dashboards, time tracking, and resource planning.
- **Agency operating loop:** engagements, deliverables, approvals, billing, payments, bookkeeping, and profitability connected to the work that produced them.
- **Collaboration:** channels, threads, comments, mentions, inbox attention, notifications, and client-facing workflows.
- **AI and automation:** Eve agents, organization-scoped AI conversations, MCP tools, scheduled automations, and permission-aware execution.
- **Multi-level access:** server-enforced Organization → Space → Project permissions with record-aware authorization.
- **Multiple surfaces:** localized web workspace, desktop packaging, Expo mobile application, marketing site, and integration adapters.

## Product principles

Qentrah is built around a few non-negotiable rules:

1. **One authoritative record per business concept.** Deals do not compete with a second opportunity model, and AI tools call the same lifecycle operations as human-facing adapters.
2. **Authorization is server-owned.** Client capability state may improve the interface, but it never grants access.
3. **Reactive data stays reactive.** Convex owns server records; IndexedDB is reserved for drafts and client-only configuration.
4. **Bookmarkable work has real routes.** Table, list, board, calendar, timeline, dashboard, and advanced-search views remain linkable and policy-filtered.
5. **Agents inherit human boundaries.** MCP and Eve execution remains scoped to the authenticated Organization, Space, Project, and resource permissions.

The domain vocabulary and deepened module boundaries are documented in [CONTEXT.md](CONTEXT.md).

## Repository structure

| Path | Responsibility |
| --- | --- |
| `apps/workspace` | Main Next.js web application, desktop shell, Convex backend, MCP adapters, and Eve runtime |
| `apps/mobile` | Expo and React Native mobile application |
| `apps/marketing` | Localized public website and Contentful delivery adapter |
| `apps/zapier` | Zapier integration application |
| `apps/partners` | Partner-facing static resources; runtime behavior lives in Workspace and partner packages |
| `agent` | Eve agents, channels, instructions, tools, and scoped subagents |
| `packages` | Shared contracts, authentication policy, UI, brand identity, and integration packages |
| `docs` | Architecture, decisions, lifecycles, compliance evidence, and operating runbooks |
| `scripts` | Repository verification, generation, licensing, brand, and release utilities |

Important architecture references:

- [Module ownership map](docs/architecture/qentrah-module-map.md)
- [Generated interface map](docs/architecture/qentrah-codebase-interface-map.md)
- [Agent execution roadmap](docs/architecture/qentrah-agent-execution-roadmap.md)
- [Architecture decisions](docs/decisions/)
- [Connected lifecycle documentation](docs/lifecycles/)

## Technology

- Next.js, React, TypeScript, and Tailwind CSS
- Convex for authoritative reactive data and backend execution
- Better Auth for identity, sessions, organizations, and teams
- Hono for server adapters and protocol endpoints
- Eve and the Model Context Protocol for agentic workflows
- Expo and React Native for mobile
- Electron Builder for desktop distribution
- Dodo Payments for subscription and payment flows
- IndexedDB for recoverable drafts and device-local preferences
- npm workspaces for the monorepo

## Local development

### Requirements

- Node.js 22 or later
- npm
- Service credentials for the application surface being run

Install the workspace from the repository root:

```bash
npm ci
```

Copy only the relevant committed environment examples and provide local values. Do not commit `.env` files, credentials, production identifiers, or customer data. See [setup and configuration](docs/operations/setup-and-configuration.md) for the current environment contract.

Start a product surface:

```bash
npm run dev:ws                  # Workspace web app and Convex development runtime
npm run dev:workspace:desktop   # Workspace desktop development shell
npm run dev:marketing           # Marketing site on port 3005
npm run dev:mobile              # Expo mobile development server
npm run dev:zapier              # Zapier integration development server
```

`apps/partners` is a retained static surface rather than an executable npm workspace.

## Common commands

| Command | Purpose |
| --- | --- |
| `npm run build` | Build workspaces that expose a build command |
| `npm run test` | Run workspace test commands |
| `npm run typecheck` | Type-check participating workspaces |
| `npm run licenses:check` | Validate the separate dependency-license inventory |
| `npm run licenses:project:check` | Validate Qentrah licensing, package guards, and asset boundaries |
| `npm run publication:check` | Run the strict release gate; expected to fail until legal approval is recorded |
| `npm run docs:codebase-map` | Regenerate the interface inventory |
| `npm run docs:codebase-map:check` | Confirm the committed interface inventory is current |
| `npm run brand:assets` | Generate Qentrah-branded runtime assets from the canonical brand owner |
| `npm run assets:public` | Generate neutral placeholders for non-brand public media |

Focused Workspace verification:

```bash
npm --workspace @qentrah/workspace run typecheck
npm --workspace @qentrah/workspace run test:agency-readiness
npm --workspace @qentrah/workspace run check:convex-runtime
```

## Contributing

External contributions remain closed until the licensing and publication packet receives legal approval. Once contributions open:

1. start with a GitHub issue containing a bounded outcome and acceptance criteria;
2. follow the domain ownership and architecture decisions before adding a new module;
3. keep pull requests issue-sized and include focused verification evidence; and
4. sign the approved individual or entity Contributor License Agreement through CLA Assistant.

Read [CONTRIBUTING.md](CONTRIBUTING.md), [AGENTS.md](AGENTS.md), and the repository's GitHub issue and pull-request templates before starting work.

Security vulnerabilities must never be reported in a public issue. Follow [SECURITY.md](SECURITY.md).

## Source-available license

Qentrah source code and non-brand documentation are licensed by Ahmed Mansour under the [Business Source License 1.1](LICENSE).

- Non-production use is permitted under BSL 1.1.
- The Additional Use Grant permits the production uses defined in `LICENSE`, including qualifying personal, educational, research, nonprofit, governmental, and small-business use.
- The small-business grant requires the user and all affiliated entities to have earned less than USD 1,000,000 in consolidated worldwide gross revenue during the previous fiscal year.
- Other production use requires a separately negotiated [commercial license](COMMERCIAL-LICENSE.md).
- Qentrah `v0.1.0` changes to Apache License 2.0 on **15 July 2030**.

Qentrah is **source-available, not Open Source**, before the Change Date. The complete license controls if this summary differs from its terms.

The included Qentrah logo and trademarks are not licensed under BSL. Unmodified builds may display the included identity; forks and modified distributions must rebrand according to [TRADEMARKS.md](TRADEMARKS.md).

## Publication status

Repository visibility must remain private until the release gates are complete. The current evidence and required approvals are tracked in:

- [Source-available readiness](docs/compliance/open-source-readiness.md)
- [Publication runbook](docs/operations/source-publication.md)
- [Secret-scan review](docs/compliance/secret-scan-review.md)
- [Copyright provenance](docs/compliance/copyright-provenance.md)
- [Asset provenance](docs/compliance/asset-provenance.json)

No preparation document, milestone, or successful non-strict check authorizes publication or creation of the `v0.1.0` release.

## Community policies

- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)
- [Commercial licensing](COMMERCIAL-LICENSE.md)
- [Trademark policy](TRADEMARKS.md)

For licensing questions, contact [legal@qentrah.com](mailto:legal@qentrah.com).
