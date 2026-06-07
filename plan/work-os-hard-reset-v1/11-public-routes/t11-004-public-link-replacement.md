# T11-004 - Public Link Replacement

Status: [ ]
Workstream: Public Routes
Depends on: T11-001, T11-002, T11-003

Goal:
Replace public links that point to removed real-estate routes.

Inputs:
- Marketing app
- Workspace public pages
- Partner docs and examples

Steps:
- Search for links to removed routes.
- Replace with Work OS docs, app, or contact destinations.
- Update tests that assert old links.
- Verify no broken imports or hrefs remain.

Traps:
- Do not replace partner developer portal links by mistake.
- Do not leave dead links in localized content.

Acceptance:
- Public links no longer route users into removed real-estate pages.

Tests:
- `rg -n "href=.*(properties|broker|developer)|/(properties|broker|developer)" apps docs packages`
- `npm run typecheck --workspaces --if-present`

Completion note:
