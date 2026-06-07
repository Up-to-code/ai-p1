# T10-001 - Context Glossary Update

Status: [ ]
Workstream: Docs Copy Cleanup
Depends on: T01-001

Goal:
Keep `CONTEXT.md` aligned with the final Work OS language.

Inputs:
- Root `CONTEXT.md`
- Plan glossary
- Domain model task outputs

Steps:
- Add missing Work OS terms.
- Remove or reclassify real-estate default language.
- Keep existing partner/auth/security decisions intact.
- Use architecture skill vocabulary for Modules, Interfaces, Seams, and Adapters.

Traps:
- Do not turn `CONTEXT.md` into a full product spec.
- Do not delete unrelated partner platform language.

Acceptance:
- Architecture agents can use `CONTEXT.md` to reason about Work OS.

Tests:
- `rg -n "Work OS core records|Workspace template|Custom field definition|Record link|Automation rule" CONTEXT.md`

Completion note:
