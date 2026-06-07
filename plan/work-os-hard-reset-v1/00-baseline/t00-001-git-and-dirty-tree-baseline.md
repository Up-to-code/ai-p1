# T00-001 - Git And Dirty Tree Baseline

Status: [x]
Workstream: Baseline
Depends on: None

Goal:
Capture the current worktree before implementation so agents do not overwrite unrelated user changes.

Inputs:
- `git status --short`
- Existing untracked Work OS files
- Existing deleted real-estate files

Steps:
- Record the status output in the completion note.
- Identify files already touched by previous conversion work.
- Name any unrelated dirty areas that must be ignored.

Traps:
- Do not run destructive git commands.
- Do not assume deleted files are safe to restore.

Acceptance:
- Dirty tree is documented before runtime edits begin.
- Risky unrelated areas are named.

Tests:
- `git status --short`

Completion note:
- Completed on 2026-06-06.
- Evidence command: `git status --short`.
- The worktree is broadly dirty before implementation. It includes modified
  files across `CONTEXT.md`, Admin, Demo Partner App, Marketing, Mobile,
  Partners, Workspace, and shared packages.
- Existing conversion work is already present: deleted property routes/modules,
  added assets/work-os/opportunities/tasks/automations paths, added
  `packages/domain-contracts/src/assets.ts`, added
  `packages/domain-contracts/src/workOs.ts`, and the new `plan/` folder.
- Risky areas to avoid reverting: all deleted `properties` files, the untracked
  Work OS and asset modules, mobile conversation changes, partner platform
  changes, and shared package changes.
- No destructive git commands were run.
