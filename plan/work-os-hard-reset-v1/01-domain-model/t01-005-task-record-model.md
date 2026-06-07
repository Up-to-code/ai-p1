# T01-005 - Task Record Model

Status: [x]
Workstream: Domain Model
Depends on: T01-001

Goal:
Define Task as a top-level Work OS record instead of a client-only subresource.

Inputs:
- Existing `clientTasks` schema, APIs, and UI usage
- Existing task placeholder route

Steps:
- Define fields: title, status, priority, assignee, due date, description, checklist, tags.
- Define linked records: client, opportunity, project, event, asset.
- Define default statuses: todo, in progress, waiting, done, canceled.
- Define board grouping by status and table columns by assignee, due date, priority.

Traps:
- Do not keep `clientTasks` naming after the reset.
- Do not require every task to belong to a client.

Acceptance:
- Task is generic and linkable to any core record.
- Existing client task behavior is replaced by record links.

Tests:
- `rg -n "clientTasks|client-tasks|client task|viewing checklist" apps/workspace`

Completion note:
- Completed on 2026-06-06.
- Evidence: [domain-interface-spec.md](../domain-interface-spec.md) defines Task
  as a top-level record with fields, statuses, priority values, views, AI
  actions, automation triggers, and links.
- The model explicitly replaces client-only task behavior with generic record
  links.
