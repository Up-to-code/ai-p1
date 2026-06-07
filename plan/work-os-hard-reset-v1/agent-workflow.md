# Agent Workflow

## Before any task

- Read this file, [glossary.md](./glossary.md), and the selected task file.
- Inspect current code before editing. Previous notes are hints, not proof.
- Check `git status --short` and avoid reverting unrelated user work.
- Use the task id in progress notes.

## During a task

- Keep the task atomic. Do not expand it into adjacent tasks.
- If a missing dependency appears, add a blocker note in the task file or pause
  for the owning dependency.
- Add newly discovered subtasks with [task-template.md](./task-template.md) and
  place them in [tasks.md](./tasks.md) only when they are required for V1.
- Use [dependency-map.md](./dependency-map.md) to decide whether a task can run
  now or must wait for an Interface to stabilize.
- Prefer existing repo Modules, Interfaces, Seams, and Adapters.
- Keep Work OS vocabulary consistent with [glossary.md](./glossary.md).
- Treat real estate as forbidden core language unless explicitly allowed by
  [forbidden-terms.md](./forbidden-terms.md).

## Completing a task

- Run every command listed in the task file.
- Add a completion note with the evidence used.
- Check the task in [tasks.md](./tasks.md) only after verification.
- Do not mark parent workstreams complete by implication.

## Blockers

Use this format inside the task file:

```md
Blocker:
- Date:
- Evidence:
- Required decision or dependency:
```
