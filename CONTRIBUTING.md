# Contributing to Qentrah

Qentrah is being prepared for source-available public development. External
contributions remain closed until legal counsel approves the license,
Contributor License Agreements, trademark policy, and publication packet.

## Before opening work

Use a GitHub issue to agree on user-visible changes before investing in a
large implementation. Security vulnerabilities must follow
[SECURITY.md](SECURITY.md) and must not be filed publicly.

Read these repository guides before changing product code:

- `CONTEXT.md` for domain language and ownership boundaries.
- `docs/decisions/` for accepted architecture decisions.
- `docs/architecture/qentrah-module-map.md` for module ownership.
- `docs/architecture/qentrah-codebase-interface-map.md` for generated public
  interfaces.
- `AGENTS.md` for repository automation guidance.

## Local setup

Use Node.js 22 and npm workspaces, matching CI:

```bash
npm ci
npm run dev:ws
```

Copy only a committed `.env.example` relevant to the application. Never commit
credentials, `.env` variants, private keys, production data, or customer data.

## Change expectations

- Keep pull requests issue-sized and focused on one outcome.
- Preserve server-side Organization, Space, Project, and record authorization.
- Extend the owning domain or shared component before creating a duplicate.
- Add focused tests for changed behavior.
- Update domain maps, decisions, or lifecycle docs when ownership changes.
- Run the dependency and project license gates before review.

```bash
npm run licenses:check
npm run licenses:project:check
npm run docs:codebase-map:check
npm --workspace @qentrah/workspace run typecheck
```

## Contributor License Agreement

After external contributions open, every human contributor must sign the
applicable Harmony-based Individual or Entity CLA in `docs/legal/cla/` through
CLA Assistant. The CLA preserves contributor ownership while granting Ahmed
Mansour the rights needed to distribute contributions under BSL, commercial,
and future open-source terms. A pull request cannot merge until the required
CLA status check passes.

The CLA documents are pending legal approval. Pull requests from external
contributors must not be accepted before that approval is recorded.
