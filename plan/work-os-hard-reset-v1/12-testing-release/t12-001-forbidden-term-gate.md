# T12-001 - Forbidden Term Gate

Status: [ ]
Workstream: Testing Release
Depends on: T10-005, T11-004

Goal:
Prove active product code no longer uses forbidden real-estate language.

Inputs:
- [Forbidden terms](../forbidden-terms.md)
- Current source and docs

Steps:
- Run forbidden-term search.
- Classify every remaining match.
- Remove unexpected active matches.
- Write the final classification into the completion note.

Traps:
- Do not count absence of obvious routes as proof; search all active areas.
- Do not ignore tests, messages, or prompts.

Acceptance:
- Remaining forbidden terms are only allowed exceptions.

Tests:
- `rg -n "property|properties|unit|units|broker|brokerage|developer|REGA|listing|listings|viewing|bedroom|bedrooms|bathroom|bathrooms|inventory|title deed" apps packages docs CONTEXT.md plan`

Completion note:
