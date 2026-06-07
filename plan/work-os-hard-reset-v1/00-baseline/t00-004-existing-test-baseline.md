# T00-004 - Existing Test Baseline

Status: [x]
Workstream: Baseline
Depends on: T00-001

Goal:
Record which tests currently pass or fail before the hard reset begins.

Inputs:
- Workspace package scripts
- Domain contracts package scripts
- Existing failing or deleted test references

Steps:
- Run narrow checks that are already relevant to Work OS conversion.
- Record failures exactly, without fixing them in this task.
- Identify tests that still encode real-estate assumptions.

Traps:
- Do not make code changes to get baseline tests passing.
- Do not treat unrelated existing failures as conversion completion blockers until classified.

Acceptance:
- Baseline results are recorded.
- Known old-model tests are routed to downstream tasks.

Tests:
- `npm --workspace @qentrah/domain-contracts test`
- `npm --workspace @qentrah/domain-contracts run build`
- `npm --workspace @qentrah/workspace run typecheck`

Completion note:
- Completed on 2026-06-06.
- Evidence commands and results:
  - `npm --workspace @qentrah/domain-contracts test`: passed, 2 test files and
    18 tests.
  - `npm --workspace @qentrah/domain-contracts run build`: passed, including
    dependent `@qentrah/platform-core`, `@qentrah/brand-identity`, and
    `@qentrah/auth` builds.
  - `npm --workspace @qentrah/workspace run typecheck`: passed.
- These results prove the current dirty baseline typechecks for the checked
  package surfaces. They do not prove the Work OS conversion is complete.
- Old-model tests still exist and must be handled by downstream workstreams,
  especially clients, projects, calendar, assets, AI, and MCP.
