# T07-008 - AI Tests And Evals

Status: [ ]
Workstream: AI
Depends on: T07-002, T07-003, T07-004, T07-005, T07-006, T07-007

Goal:
Add AI regression tests and eval cases for the converted Work OS behavior.

Inputs:
- Agent tests
- Mobile assistant tests if relevant
- Tool input tests

Steps:
- Add cases for summarizing a project, creating a task, updating an opportunity, scheduling an event, and linking an asset.
- Add negative cases for forbidden real-estate assumptions.
- Add confirmation and risk-policy cases.
- Update mobile assistant fixtures if they expose old language.

Traps:
- Do not rely only on snapshots.
- Do not test prompts without testing tool-shape behavior.

Acceptance:
- AI behavior is covered at prompt, context, plan, confirmation, and execution seams.

Tests:
- `npm --workspace @qentrah/workspace test -- src/server/domains/agents src/domains/agents`
- `npm --workspace @qentrah/mobile test`

Completion note:
