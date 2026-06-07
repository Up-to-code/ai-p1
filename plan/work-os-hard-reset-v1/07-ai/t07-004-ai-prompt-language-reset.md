# T07-004 - AI Prompt Language Reset

Status: [ ]
Workstream: AI
Depends on: T07-001

Goal:
Remove real-estate language from AI prompts, tool descriptions, examples, and tests.

Inputs:
- Agent language files
- Orchestrator tests
- Risk policy tests
- Tool input examples

Steps:
- Replace property/unit/viewing examples with Work OS examples.
- Update system and tool instructions to use core record vocabulary.
- Update tests that assert old language.
- Ensure Arabic/English copies remain concise.

Traps:
- Do not only rename visible strings while keeping old tool shapes.
- Do not create verbose assistant copy.

Acceptance:
- AI prompts and tests describe generic Work OS work.
- No active AI prompt requires real-estate context.

Tests:
- `npm --workspace @qentrah/workspace test -- src/server/domains/agents`
- `rg -n "property|unit|broker|developer|viewing|REGA" apps/workspace/src/server/domains/agents apps/workspace/src/domains/agents`

Completion note:
