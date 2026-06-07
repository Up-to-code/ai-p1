# T03-003 - Module Layout System

Status: [ ]
Workstream: UI Shell
Depends on: T03-001

Goal:
Create or standardize a reusable module layout for records.

Inputs:
- Existing client/project/calendar screens
- Placeholder Work OS module screen
- UI package components

Steps:
- Define layout regions: title, primary action, filters, view switcher, list/board/calendar, detail surface.
- Keep card nesting low and spacing consistent.
- Support table, board, calendar, and detail states.
- Make the layout reusable without hiding record-specific behavior.

Traps:
- Do not make a shallow wrapper that only passes through every prop.
- Do not force every module into the same view if the record does not need it.

Acceptance:
- Record modules share layout locality and still keep specific forms/details clear.
- Layout supports responsive behavior.

Tests:
- `npm --workspace @qentrah/workspace run typecheck`
- Browser QA for at least one table, board, and detail screen.

Completion note:
