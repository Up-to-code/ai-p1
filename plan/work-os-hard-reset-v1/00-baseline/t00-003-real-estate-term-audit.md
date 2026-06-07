# T00-003 - Real Estate Term Audit

Status: [x]
Workstream: Baseline
Depends on: T00-001

Goal:
Create the authoritative current list of forbidden-term matches before implementation.

Inputs:
- [Forbidden terms](../forbidden-terms.md)
- Workspace source
- Shared packages
- Product docs
- Marketing and partner copy

Steps:
- Search active source and docs for every forbidden term.
- Group matches by workstream.
- Classify each group as remove, rename, or allowed exception.
- Feed the groups into downstream task files if a missing task appears.

Traps:
- Do not count old-decision references as active product language.
- Do not ignore terms inside tests; tests can preserve old behavior accidentally.

Acceptance:
- Audit identifies all known real-estate cleanup areas.
- Final forbidden-term gate has a baseline to compare against.

Tests:
- `rg -n "property|properties|unit|units|broker|brokerage|developer|REGA|listing|viewing|bedroom|bathroom|inventory|title deed" apps packages docs CONTEXT.md`

Completion note:
- Completed on 2026-06-06.
- Evidence command:
  - `rg -n "property|properties|unit|units|broker|brokerage|developer|REGA|listing|listings|viewing|bedroom|bedrooms|bathroom|bathrooms|inventory|title deed" apps packages docs CONTEXT.md --glob '!node_modules'`
- The command returned 1289 matching lines before terminal truncation.
- Compact file counts:
  - 362 files match at least one forbidden-term pattern.
  - 127 matching files are in Workspace source/Convex.
  - 47 matching files are in shared packages.
  - 35 matching files are in docs or `CONTEXT.md`.
  - 40 matching files are in Marketing, Partners, or Demo Partner App.
- Main remove/rename groups:
  - Product docs still describe Qentrah as real estate and reference properties,
    units, broker/developer audience, REGA, and property APIs.
  - Workspace public broker/developer pages and robots entries remain.
  - Clients still include `viewing`, unit-link statuses, and property/asset
    interest assumptions.
  - Projects still include developer, REGA, inventory, and unit assumptions.
  - Calendar still includes `site-viewing` examples and event types.
  - Assets still include bedrooms/bathrooms and listing-style fields.
  - AI tool inputs and risk-policy tests still include viewing, bedrooms,
    bathrooms, developer, and site-viewing.
  - MCP/tool docs still include old property and client-task concepts.
  - Shared auth/workspace logic still includes broker/developer terms that must
    be classified carefully because some `developer` usage means partner
    developer, not real-estate developer.
- Allowed-exception candidates:
  - Partner developer portal language when it refers to external app developers.
  - Historical lifecycle/docs references.
  - Generic JavaScript `property` variable names in implementation utilities.
