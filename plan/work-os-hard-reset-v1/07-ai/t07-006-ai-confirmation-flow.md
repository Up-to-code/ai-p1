# T07-006 - AI Confirmation Flow

Status: [ ]
Workstream: AI
Depends on: T07-005

Goal:
Require confirmation for risky AI-proposed writes.

Inputs:
- Existing confirmation handlers
- Risk policy
- Tool adapter

Steps:
- Define confirmation card content for generic records.
- Require confirmation for create/update/delete/link actions above the policy threshold.
- Ensure cancellation leaves no side effects.
- Add tests for confirmation required, accepted, and rejected flows.

Traps:
- Do not make read-only summaries require confirmation.
- Do not bypass confirmation through MCP or connector paths.

Acceptance:
- Risky AI writes are gated by clear confirmation.
- Confirmation flow uses Work OS vocabulary.

Tests:
- `npm --workspace @qentrah/workspace test -- src/server/domains/agents/services/confirmations.ts src/server/domains/agents/services/orchestrator.test.ts`

Completion note:
