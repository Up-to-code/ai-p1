# T03-004 - Empty Loading Error States

Status: [ ]
Workstream: UI Shell
Depends on: T03-003

Goal:
Standardize empty, loading, and error states across Work OS modules.

Inputs:
- Existing module screens
- Query/debug components
- Message dictionaries

Steps:
- Define compact empty states for each record type.
- Define loading placeholders that preserve layout size.
- Define error states with retry behavior.
- Remove real-estate examples from state copy.

Traps:
- Do not add long instructional paragraphs.
- Do not let loading text shift fixed UI elements.

Acceptance:
- Every core module has neutral empty/loading/error states.
- States render on mobile without overlap.

Tests:
- `npm --workspace @qentrah/workspace run typecheck`
- Browser QA for empty and loading states.

Completion note:
