# T07-005 - AI Action Planning

Status: [ ]
Workstream: AI
Depends on: T07-003, T08-001

Goal:
Make AI propose generic Work OS actions before execution.

Inputs:
- Agent orchestrator
- MCP tool taxonomy
- Confirmation policy

Steps:
- Define action plan shape: intent, target record, proposed changes, required tool, risk level.
- Map common user intents to generic tools.
- Support create task, update opportunity, schedule event, link asset, summarize project.
- Add tests for ambiguous and confirmed actions.

Traps:
- Do not call tools directly without building an inspectable plan.
- Do not hard-code real-estate action names.

Acceptance:
- AI action planning is generic, testable, and confirmable.
- User can see what will happen before write execution.

Tests:
- `npm --workspace @qentrah/workspace test -- src/server/domains/agents/services/orchestrator.test.ts`

Completion note:
