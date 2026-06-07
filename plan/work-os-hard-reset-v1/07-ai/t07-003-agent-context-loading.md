# T07-003 - Agent Context Loading

Status: [ ]
Workstream: AI
Depends on: T01-009, T07-001

Goal:
Load generic Work OS context for agent conversations.

Inputs:
- Agent read handlers
- Core record queries
- Record links

Steps:
- Define context packets for global workspace, module, and record detail contexts.
- Include linked records where relevant.
- Exclude forbidden real-estate assumptions.
- Add tests for context loading across at least two record types.

Traps:
- Do not over-fetch whole tables.
- Do not include private connector secrets or full sensitive logs.

Acceptance:
- Agent context works through generic record and link interfaces.
- Context loading has locality behind a small Module Interface.

Tests:
- `npm --workspace @qentrah/workspace test -- src/server/domains/agents/handlers/read.test.ts`
- `npm --workspace @qentrah/workspace run typecheck`

Completion note:
