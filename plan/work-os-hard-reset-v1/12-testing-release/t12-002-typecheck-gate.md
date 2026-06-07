# T12-002 - Typecheck Gate

Status: [ ]
Workstream: Testing Release
Depends on: T12-001

Goal:
Prove the converted monorepo typechecks.

Inputs:
- All changed apps and packages

Steps:
- Run package-level typechecks first for changed packages.
- Run workspace-wide typechecks.
- Record failures and route them to owning task files.

Traps:
- Do not use a narrow package typecheck as proof for the whole conversion.

Acceptance:
- Required typecheck commands pass or blockers are documented.

Tests:
- `npm --workspace @qentrah/domain-contracts run build`
- `npm --workspace @qentrah/workspace run typecheck`
- `npm run typecheck --workspaces --if-present`

Completion note:
