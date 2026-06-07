# T07-007 - AI Risk Policy

Status: [ ]
Workstream: AI
Depends on: T07-001, T07-006

Goal:
Reset AI risk policy around Work OS records and actions.

Inputs:
- Existing risk policy files and tests
- MCP permissions task
- Connector permissions task

Steps:
- Classify read, draft, create, update, delete, link, automation, and connector actions.
- Define which actions require confirmation.
- Replace old viewing/property risk examples.
- Add tests for each risk category.

Traps:
- Do not weaken existing safety because the domain changed.
- Do not forget connector-triggered writes.

Acceptance:
- Risk policy matches Work OS action taxonomy.
- Tests prove high-risk writes cannot execute silently.

Tests:
- `npm --workspace @qentrah/workspace test -- src/server/domains/agents/policies/risk-policy.test.ts`

Completion note:
