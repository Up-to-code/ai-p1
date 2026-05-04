# Index Files

Purpose: Every folder index lists purpose, scope, files, read order, related domains, and maintenance rules.

## Owns

- Every folder index lists purpose, scope, files, read order, related domains, and maintenance rules.
- Update index when adding files.
- Index is navigation, not full spec.

## Does Not Own

- Does not add CRM, marketplace, lead pipeline, or deal pipeline behavior.
- Does not bypass Better Auth, Convex authorization, approval workflows, visibility rules, or audit requirements.
- Does not duplicate broad content owned by another domain.

## Documentation Boundary

- Every folder must have an index.md.
- File names use lowercase kebab-case.
- No new giant root-level documents are allowed.

## Implementation Rules

- Keep this file focused on index files only.
- Use Zod for public payload validation when payloads are involved.
- Use server-side authorization for protected behavior.
- Include explicit failure states where this topic affects synchronization, visibility, security, or compliance.
- Link to related domain files instead of copying their full content.

## Verification

- Confirm this file remains under the 150-300 line target.
- Confirm it references the correct owning domain.
- Confirm no secrets, raw tokens, raw API keys, or personal data appear in examples.
- Confirm sold and off-market marketplace suppression is preserved when visibility is affected.
