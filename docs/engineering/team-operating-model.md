# Team Operating Model

Qentrah should scale to many teams by making ownership obvious, routing reviews
through the right maintainers, and keeping documentation close to the decision
or runtime it explains.

## Ownership Areas

| Area | Owns | Primary docs |
| --- | --- | --- |
| Workspace runtime | Product app, organization data, OAuth provider, partner resource APIs, Convex business data | `apps/workspace/README.md`, `apps/workspace/docs/README.md` |
| Partners runtime | Developer portal, app catalog, docs, sandbox, platform APIs | `apps/partners/README.md`, `apps/partners/content/docs/index.mdx` |
| Admin Review | Internal app review queue and decision UI | `apps/admin/README.md` |
| Demo Partner App | Reference OAuth partner implementation | `apps/demo-partner-app/README.md` |
| Marketing | Public website and legal pages | `apps/marketing/README.md` |
| Shared packages | Cross-app contracts, auth primitives, reusable UI, and pure logic | Package READMEs and `docs/architecture/apps-and-packages.md` |
| Operations | Env, deployments, secrets, and production runbooks | `docs/operations/README.md` |
| Architecture | Runtime ownership, data ownership, decisions, and cross-app flows | `docs/architecture/README.md`, `docs/decisions/README.md` |

## Review Routing

- Route app-specific changes to the owning app maintainers first.
- Route shared package changes to every app owner that imports the changed
  package.
- Route auth, OAuth, token, grant, scope, permission, and service-token changes
  through Workspace, Partners, and Operations reviewers.
- Route partner-facing contract changes through Partners and Demo Partner App
  reviewers.
- Route data retention, auditability, privacy, and compliance changes through
  Workspace, Operations, and Architecture reviewers.
- Route documentation-only changes to the owner of the narrowest affected doc.

## Working Rules For Many Teams

- Start from the ownership docs before editing a runtime or shared package.
- Keep a change inside the owning app unless reuse is already real.
- Move contracts into `packages/*` only when another runtime consumes them.
- Update lifecycle docs before connected changes that affect auth, schemas,
  APIs, env, migrations, partner flows, or review behavior.
- Prefer semantic doc names over numeric or date-prefixed names.
- Use links to shared docs instead of copying the same policy into many local
  files.

## Documentation Ownership

- Root README and `docs/README.md` are orientation docs.
- App READMEs own app-local setup, commands, routes, and runtime boundaries.
- Package READMEs own package purpose, public exports, and validation commands.
- `apps/workspace/docs` owns deep Workspace domain rules.
- `apps/partners/content/docs` owns public partner-facing documentation.
- `docs/lifecycles/<slug>/` owns connected workflow dependency maps.
- `docs/decisions` owns accepted architecture decisions.

## Conflict Resolution

When two teams need the same behavior, decide the owner by source of truth:

- Customer organization data belongs to Workspace.
- Partner developer app metadata belongs to Partners.
- Internal review UI belongs to Admin Review, while review state belongs to
  Partners.
- Public partner implementation examples belong to Demo Partner App and
  partner docs.
- Cross-app schemas belong in shared packages only after at least two runtimes
  need them.

If ownership is still unclear, add or update an architecture decision before
implementation.
