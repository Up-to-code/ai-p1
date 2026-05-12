# App Router

Purpose: Use Next.js 16.2.4 App Router.

## Owns

- Use Next.js 16.2.4 App Router.
- Separate auth routes from hub admin routes.
- Server components may preload authenticated Convex queries; client components handle ShadCN interactions.

## Does Not Own

- Does not add CRM, marketplace, lead pipeline, or deal pipeline behavior.
- Does not bypass Better Auth, Convex authorization, approval workflows, visibility rules, or audit requirements.
- Does not duplicate broad content owned by another domain.

## Architecture Boundary

- Next.js owns app routing and UI shell.
- Convex owns backend functions and reactive data.
- Domain modules own policy decisions.

## Implementation Rules

- Keep this file focused on app router only.
- Use Zod for public payload validation when payloads are involved.
- Use server-side authorization for protected behavior.
- Include explicit failure states where this topic affects synchronization, visibility, security, or compliance.
- Link to related domain files instead of copying their full content.

## Verification

- Confirm this file remains under the 150-300 line target.
- Confirm it references the correct owning domain.
- Confirm no secrets, raw tokens, raw API keys, or personal data appear in examples.
- Confirm sold and off-market marketplace suppression is preserved when visibility is affected.
