---
name: lifecycle-guard
description: "Use before editing Qentrah code that affects functions, APIs, routes, Convex functions, lifecycle software flows, integrations, auth paths, environment or secret behavior, schemas, migrations, partner flows, admin/workspace/partners cross-app behavior, or other connected workflows. Enforces lifecycle documentation in docs/lifecycles before and during implementation so future agents can trace the flow, touched files, dependencies, tests, risks, and reasons for changes."
---

# Lifecycle Guard

Use this skill as a strict preflight for connected code changes in Qentrah. It protects functional flows from accidental breakage by keeping a lifecycle folder beside the code work.

## When To Trigger

Trigger before file edits when the request may affect:

- Functions, APIs, routes, Hono handlers, server actions, Convex queries/mutations/actions, or scheduled jobs.
- Auth, authorization, sessions, service tokens, API keys, secrets, environment variables, encryption, webhooks, integrations, or partner platform flows.
- Schema, migrations, compatibility layers, data validation, idempotency, permissions, audit logs, or cross-app behavior between `apps/workspace`, `apps/admin`, `apps/partners`, and shared packages.
- UI flows that depend on backend lifecycle state, such as admin review, partner connection authorization, webhook delivery, organization API keys, or client/property/task workflows.

For tiny local edits that truly do not touch a lifecycle, state why this skill does not apply before editing.

## Lifecycle Root

Lifecycle folders live under:

```text
docs/lifecycles/<slug>/
```

Use a stable kebab-case slug that names the business or technical lifecycle, not the ticket. Examples:

- `partner-connection-authorization`
- `webhook-delivery`
- `organization-api-keys`
- `admin-review`
- `convex-env-secrets`

## Required Folder Contract

Each lifecycle folder must contain these files. Keep them compact for small changes, but keep the structure stable.

- `README.md`: purpose, owner app/package, entrypoints, actor/system flow, current status.
- `files.md`: files, functions, routes, tables, and jobs involved, with why each matters.
- `flow.md`: old/current flow in steps, including upstream and downstream dependencies.
- `tests.md`: existing tests, commands run, missing coverage, and manual checks.
- `risks.md`: coupling risks, known breakpoints, env/secrets, schema/data compatibility, rollback notes.
- `changes.md`: dated entries summarizing what changed and why.

## Workflow

### Before Editing

1. Classify the lifecycle and choose a slug.
2. Search `docs/lifecycles/` for a matching folder.
3. If found, read the lifecycle notes before touching code.
4. Inspect related source and tests for the current flow, including upstream callers and downstream consumers.
5. Create or update the lifecycle folder before implementation when the folder is absent, stale, or missing relevant dependency context.

Use this preflight line before code edits:

```text
LIFECYCLE_GUARD_PREFLIGHT: lifecycle=<slug> docs=<found|created|updated|not_applicable:reason> scope=<short summary>
```

### During Implementation

- Keep code edits aligned with the lifecycle docs.
- Record dependent files and why they were touched.
- Update `flow.md` when behavior, sequencing, compatibility, permissions, or data shape changes.
- Update `risks.md` when secrets, schema compatibility, migration order, permissions, rollback, or cross-app coupling is relevant.
- Add a dated `changes.md` entry for the actual change.

### Before Final Response

Confirm:

- Lifecycle folder path updated or a reason this skill was not applicable.
- Tests/checks run.
- Any lifecycle risks still open.

## Dry-Run Example

For the `organizationPartnerConnections` schema compatibility issue, the lifecycle folder should capture:

- Old fields: `partnerAppId`, `oauthClientId`.
- New fields: `partnersAppId`, `partnersClientId`.
- Dependent schema, Convex queries, admin summaries, webhook delivery, and access-token validation.
- Migration and backward-compatibility risk before schema deployment.

The goal is not to replace tests. The goal is to leave a dependency map and handoff record that makes the next change safer.
