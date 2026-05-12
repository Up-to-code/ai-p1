# Replay Protection

Purpose: Reject old timestamps.

## Owns

- Reject old timestamps.
- Reject repeated event IDs.
- Store replay markers with TTL.

## Does Not Own

- Does not add CRM, marketplace, lead pipeline, or deal pipeline behavior.
- Does not bypass Better Auth, Convex authorization, approval workflows, visibility rules, or audit requirements.
- Does not duplicate broad content owned by another domain.

## SDK Boundary

- Browser SDK code must not store client secrets.
- Server SDK code handles token exchange and webhook verification.
- SDK helpers simplify integration; they do not bypass hub authorization.

## Implementation Rules

- Keep this file focused on replay protection only.
- Use Zod for public payload validation when payloads are involved.
- Use server-side authorization for protected behavior.
- Include explicit failure states where this topic affects synchronization, visibility, security, or compliance.
- Link to related domain files instead of copying their full content.

## Verification

- Confirm this file remains under the 150-300 line target.
- Confirm it references the correct owning domain.
- Confirm no secrets, raw tokens, raw API keys, or personal data appear in examples.
- Confirm sold and off-market marketplace suppression is preserved when visibility is affected.
