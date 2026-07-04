# Files

## Frontend (Next.js)

| File | Role |
|---|---|
| `apps/workspace/src/proxy.ts` | Clerk middleware — route protection, org sync |
| `apps/workspace/src/app/[locale]/(auth)/sign-in/page.tsx` | Sign-in page (server) |
| `apps/workspace/src/app/[locale]/(auth)/sign-up/page.tsx` | Sign-up page (server) |
| `apps/workspace/src/app/[locale]/(auth)/sso-callback/page.tsx` | SSO callback page (server) |
| `apps/workspace/src/app/[locale]/(auth)/choose-org/page.tsx` | Org selection page (server) |
| `apps/workspace/src/domains/auth/components/auth-entry-client.tsx` | Auth entry client wrapper |
| `apps/workspace/src/domains/auth/components/auth-callback-client.tsx` | SSO callback client |
| `apps/workspace/src/domains/auth/components/choose-organization-client.tsx` | Org picker/creator |
| `apps/workspace/src/domains/auth/hooks/use-headless-clerk-auth.ts` | Headless Clerk auth hook |
| `apps/workspace/src/components/auth/auth-access-screen.tsx` | Auth form UI |
| `apps/workspace/src/domains/auth/auth-identity.ts` | `useAuthIdentity` hook |
| `apps/workspace/src/domains/auth/organization-context.ts` | `OrganizationProvider` |
| `apps/workspace/src/domains/auth/workspace-context.ts` | `WorkspaceProvider` |
| `apps/workspace/src/domains/auth/workspace-status.ts` | `deriveWorkspaceStatus` |
| `apps/workspace/src/domains/auth/auth-session.ts` | Composite `AuthSessionProvider` |
| `apps/workspace/src/domains/auth/auth-handoff.ts` | SessionStorage handoff after org acceptance |
| `apps/workspace/src/domains/auth/server-auth-routing.ts` | Server-side auth redirects |
| `apps/workspace/src/domains/auth/lib/clerk-auth-utils.ts` | Social provider strategies, error localization |
| `apps/workspace/src/domains/auth/utils/auth-callback-url.ts` | Callback URL normalization |
| `apps/workspace/src/domains/auth/index.ts` | Barrel exports |
| `apps/workspace/src/components/providers/backend-providers.tsx` | ConvexProviderWithClerk |
| `apps/workspace/src/components/providers/dashboard-app-wrapper.tsx` | AuthSession shell |
| `apps/workspace/src/components/providers/dashboard-authenticated-shell.tsx` | Auth guard + sidebar |

## Backend (Convex)

| File | Role |
|---|---|
| `convex/auth.ts` | `clerkAuthComponent` — auth helpers, stubbed org API |
| `convex/auth.config.ts` | Convex Clerk auth config |
| `convex/permissions/index.ts` | Three-layer permission system |
| `convex/organizations/profile/access.ts` | Capabilities query, resource action guards |

## Agent (Eve)

| File | Role |
|---|---|
| `apps/workspace/agent/auth/clerk-auth.ts` | Eve AuthFn using Clerk |
| `apps/workspace/agent/lib/clerk-org.ts` | Clerk Backend API client for Eve |
| `apps/workspace/agent/channels/eve.ts` | Eve channel wiring |

## Tests

| File | Role |
|---|---|
| `apps/workspace/src/domains/auth/auth-handoff.test.ts` | Handoff TTL tests |
| `apps/workspace/src/domains/auth/auth-route-source.test.ts` | Source structure tests |
| `apps/workspace/src/domains/auth/auth-callback-url.test.ts` | Callback URL tests |
| `apps/workspace/src/domains/auth/lib/clerk-auth-utils.test.ts` | Error localization tests |
