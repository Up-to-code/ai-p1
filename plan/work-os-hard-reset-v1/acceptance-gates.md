# Acceptance Gates

## Per-task gate

- Task file status is checked.
- All listed tests ran or a blocker is documented.
- The task did not silently modify adjacent workstreams.
- Any new terms match [glossary.md](./glossary.md).

## Workstream gate

- Every task file in the workstream is checked.
- Workstream-specific forbidden terms are removed or classified.
- The workstream has at least one direct verification command or browser check.

## Final gate

- `npm --workspace @qentrah/domain-contracts test`
- `npm --workspace @qentrah/domain-contracts run build`
- `npm --workspace @qentrah/workspace run typecheck`
- `npm --workspace @qentrah/workspace test`
- `npm run typecheck --workspaces --if-present`
- Forbidden-term audit passes with only allowed exceptions.
- Desktop and mobile browser QA prove the workspace shell and core modules render.
