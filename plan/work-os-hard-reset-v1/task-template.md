# Task Template

Use this template when adding a new atomic task to this plan. Keep the task
small enough that one agent can complete it, verify it, and write a completion
note without expanding into another workstream.

```md
# TXX-YYY - Task Name

Status: [ ]
Workstream: Workstream Name
Depends on: TXX-YYY, TXX-YYY
Related architecture: ./architecture-deepening.md#section-name

Goal:
One outcome. If the goal has two independent outcomes, split the task.

Inputs:
- Files, Modules, Interfaces, Seams, or docs to inspect first.
- Product rules to preserve.
- Existing tests or commands that prove the current behavior.

Steps:
- Ordered implementation steps.
- Keep each step scoped to the task goal.
- Route discovered adjacent work into a new task or blocker note.

Traps:
- Domain drift to avoid.
- Architecture mistakes to avoid.
- User-work or dirty-tree risks to avoid.

Acceptance:
- Observable behavior that proves the task is done.
- Required file, route, schema, UI, or command evidence.

Tests:
- Exact command 1
- Exact command 2

Completion note:
- Empty until the task is finished.
```

## Split rule

Split a task when it crosses any of these boundaries:

- AI, MCP, connector, automation, UI, schema, or docs ownership.
- Record model and record implementation.
- Interface design and Adapter implementation.
- UI rendering and backend persistence.
- Data model and tests that prove a separate runtime behavior.

## Completion note rule

When completing a task, include:

- files changed
- tests run
- result of each test
- remaining allowed exceptions
- blocker if any acceptance item is not proven
