# T12-003 - Unit Test Gate

Status: [ ]
Workstream: Testing Release
Depends on: T12-002

Goal:
Prove unit and integration tests cover the converted Work OS behavior.

Inputs:
- All changed packages
- Workstream task test lists

Steps:
- Run domain-contract tests.
- Run Workspace tests.
- Run partner/demo/mobile tests if touched.
- Record failures and route them to owning tasks.

Traps:
- Do not treat deleted old-model tests as coverage.
- Do not skip packages changed by connector or mobile AI work.

Acceptance:
- Relevant tests pass and prove converted behavior.

Tests:
- `npm --workspace @qentrah/domain-contracts test`
- `npm --workspace @qentrah/workspace test`
- `npm run test --workspaces --if-present`

Completion note:
