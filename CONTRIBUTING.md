# Contributing to Qentrah

Thank you for your interest in Qentrah. The repository is being prepared for
public contributions, but it is not open for external contributions until a
project license is selected and the repository is made public.

## Before opening work

Use a GitHub issue to agree on user-visible changes before investing in a large
implementation. Security vulnerabilities must follow [SECURITY.md](SECURITY.md)
and must not be filed as public issues.

Read these repository guides before changing product code:

- `CONTEXT.md` for Qentrah's domain language and ownership boundaries.
- `docs/decisions/` for accepted architecture decisions.
- `docs/architecture/qentrah-module-map.md` for module ownership.
- `docs/architecture/qentrah-codebase-interface-map.md` for generated public
  interfaces.
- `AGENTS.md` for repository-specific automation guidance.

## Local setup

Qentrah is an npm-workspaces monorepo. Use Node.js 22, matching the CI runtime.

```bash
npm ci
npm run dev:ws
```

Other application entry points are documented in [README.md](README.md). Copy
only the relevant committed `.env.example` file when configuring an app. Never
commit `.env`, `.env.local`, credentials, private keys, production data, or
customer information.

## Change expectations

- Keep each pull request issue-sized and focused on one outcome.
- Preserve Organization, Space, Project, and record-level authorization
  boundaries. Client-side visibility is not authorization.
- Extend the domain owner or existing shared component before creating a
  duplicate abstraction.
- Add or update focused tests for changed behavior.
- Update domain maps, decisions, or lifecycle documentation when ownership or
  public interfaces change.
- Do not add dependencies with unapproved licenses. Run the license check before
  requesting review.

## Verification

Run the smallest relevant checks while developing, then run the repository
gates that apply to the change:

```bash
npm run licenses:check
npm run docs:codebase-map:check
npm --workspace @qentrah/workspace run typecheck
npm --workspace @qentrah/workspace run test:agency-readiness
```

Use the pull request template to record verification and any known gaps. A pull
request is not ready to merge while it contains secrets, unexplained generated
changes, or a failing required check.

## License status

No project license has been selected yet. Until a `LICENSE` file is committed,
all rights remain reserved and external contributions cannot be accepted. This
section must be updated as part of the public-release packet.
