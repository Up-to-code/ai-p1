---
description: Use when the user asks to complete a multi-step workflow, chain actions, or automate a series of tasks in the workspace — for example "create a project with tasks", "onboard a new client", "set up a sprint", or "assign everything for next week".
---

# Workspace Workflows

## What this skill covers
How to chain multiple tool calls into a single coherent workflow, handle partial failures, and report results clearly.

## When to use multi-step execution
Use autonomous chaining when:
- The user's goal clearly requires more than one tool call to complete
- The steps have a natural dependency order (create → link → assign)
- All required inputs are already available from the user's message or the current session

Do NOT chain autonomously when:
- A step requires information you don't have (ask first)
- Any step is destructive and hasn't been confirmed yet
- You're in Plan mode (present the plan, don't execute)

## Standard workflow patterns

### Create project with tasks
1. `projects-create` — create the project with name, status, dates
2. `tasks-create` (× N) — create tasks linked to the project via `projectId`
3. Optionally `calendar-create` — add a kick-off meeting or deadline
4. Report: project name, task count, any calendar events added

### Onboard a new client
1. `clients-create` — create client record with contact info, pipeline stage
2. `tasks-create` — create a follow-up task linked to the client
3. Optionally `calendar-create` — add initial meeting
4. Report: client name, first task, next calendar event

### Assign tasks for a time period
1. `tasks-list` — fetch tasks with no assignee or matching criteria
2. `tasks-update` (× N) — set assignee and due date per task
3. Report: how many tasks were updated, by whom

### Create a document brief for a project
1. `projects-get` — read the project context
2. `docs-create` — create the document linked to the project
3. Report: document title, project it's linked to

## Handling partial failures
If one step in a chain fails:
1. Stop the chain immediately — do not continue to dependent steps
2. Report what succeeded and what failed
3. Suggest how to retry the failed step
4. Never silently skip a failed step

## Reporting completed workflows
Always end a multi-step workflow with a summary:
- What was created/updated/deleted (by name, not ID)
- Count of items affected
- Any follow-up actions the user might want

Example: "Created project **Q3 Campaign** with 4 tasks assigned to Sarah. Added a kick-off meeting on Monday at 10am."

## Limits
- Maximum 5 tool calls per autonomous chain
- If a goal requires more than 5 steps, present a plan first and get approval
- Never repeat the same tool call with the same arguments twice in one chain
