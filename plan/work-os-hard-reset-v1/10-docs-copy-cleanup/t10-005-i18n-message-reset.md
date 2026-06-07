# T10-005 - I18n Message Reset

Status: [ ]
Workstream: Docs Copy Cleanup
Depends on: T03-001, T04-006

Goal:
Reset English and Arabic messages to Work OS language.

Inputs:
- `apps/workspace/messages/en.json`
- `apps/workspace/messages/ar.json`
- Changed UI modules

Steps:
- Remove duplicate keys.
- Replace real-estate labels and placeholders.
- Keep English and Arabic keys aligned.
- Validate JSON structure.

Traps:
- Do not leave duplicate JSON keys.
- Do not update English without Arabic.

Acceptance:
- Workspace messages are valid and Work OS neutral.

Tests:
- `node -e "JSON.parse(require('fs').readFileSync('apps/workspace/messages/en.json','utf8')); JSON.parse(require('fs').readFileSync('apps/workspace/messages/ar.json','utf8'))"`
- `npm --workspace @qentrah/workspace run typecheck`

Completion note:
