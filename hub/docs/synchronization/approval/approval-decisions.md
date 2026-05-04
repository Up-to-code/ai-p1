# Approval Decisions

Purpose: Approval creates canonical property version.

## Owns

- Approval creates canonical property version.
- Approval records actor, organization, reason, timestamp, and source submission.
- Approval may trigger visibility recompute.

## Does Not Own

- Does not add CRM, marketplace, lead pipeline, or deal pipeline behavior.
- Does not bypass Better Auth, Convex authorization, approval workflows, visibility rules, or audit requirements.
- Does not duplicate broad content owned by another domain.

## Synchronization Boundary

- External systems submit claims, not truth.
- Approved canonical hub state wins.
- Idempotency is mandatory for inbound claims and outbound sync.
- Visibility recompute follows canonical state changes.

## Implementation Rules

- Keep this file focused on approval decisions only.
- Use Zod for public payload validation when payloads are involved.
- Use server-side authorization for protected behavior.
- Include explicit failure states where this topic affects synchronization, visibility, security, or compliance.
- Link to related domain files instead of copying their full content.

## Verification

- Confirm this file remains under the 150-300 line target.
- Confirm it references the correct owning domain.
- Confirm no secrets, raw tokens, raw API keys, or personal data appear in examples.
- Confirm sold and off-market marketplace suppression is preserved when visibility is affected.
