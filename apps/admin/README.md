# Qentrah Admin Review App

Admin Review is the internal Next.js console for platform security,
authorization, partner app review, and operational control surfaces. It owns
the Admin entry session. Partners is the source of truth for partner app review
state; Workspace remains the source of truth for Workspace data and
organization authorization state.

## Local Development

From the repository root:

```bash
npm run dev:admin
```

From this app folder:

```bash
npm run dev
```

Default local URL: `http://localhost:3003`.

## Responsibilities

- Provide a Workspace-style Admin shell in Arabic and English.
- Authenticate Admin directly through env-controlled Admin credentials.
- Resolve Admin roles from operator-controlled env or DB-backed allowlists.
- List and review partner app submissions through Partners admin APIs.
- Keep Admin promotion outside every UI path.

## Important Routes And Files

| Path | Purpose |
| --- | --- |
| `src/app/(auth)/sign-in/page.tsx` | Admin env credential sign-in |
| `src/app/api/admin/[[...route]]/route.ts` | Hono auth backend for Admin login/session/logout |
| `src/app/(console)/page.tsx` | Admin security overview |
| `src/app/(console)/apps/[appId]/page.tsx` | Partner review detail |
| `src/app/(console)/layout.tsx` | Protected Admin console shell |
| `src/lib/admin-session.ts` | Signed HttpOnly Admin session cookie |
| `src/lib/admin-roles.ts` | Env-controlled Admin role model |
| `src/lib/partners.ts` | Partners admin service API client |

## Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `ADMIN_AUTH_SECRET` | Yes | 32+ char secret used to sign Admin session cookies. Can share `BETTER_AUTH_SECRET` only if intentionally managed together. |
| `ADMIN_AUTH_EMAIL` | Yes for single local/admin account | Admin login email for a single env credential. |
| `ADMIN_AUTH_PASSWORD_SHA256` | Yes for single local/admin account | SHA-256 hex of the Admin login password. Do not store raw passwords. |
| `ADMIN_AUTH_CREDENTIALS` | Optional | Comma-separated `email:sha256hex:name` entries for multiple env credentials. |
| `PLATFORM_ADMIN_EMAILS` | Yes for mutation access | Operator-controlled platform-admin emails. No UI can edit this. |
| `PLATFORM_SECURITY_REVIEWER_EMAILS` | Optional | Read-only security reviewer emails. |
| `PLATFORM_SUPPORT_OPERATOR_EMAILS` | Optional | Read-only support operator emails. |
| `PLATFORM_AUDIT_VIEWER_EMAILS` | Optional | Read-only audit viewer emails. |
| `PARTNERS_API_BASE_URL` | Yes for partner app review | Partners origin, for example `http://localhost:3002`. |
| `PARTNERS_ADMIN_SERVICE_TOKEN` | Yes for partner app review | Service token accepted by Partners admin APIs. Browser never receives it. |
| `WORKSPACE_API_BASE_URL` | Optional runtime projection bridge | Workspace origin, for example `http://localhost:3000`. |
| `WORKSPACE_ADMIN_SERVICE_TOKEN` | Runtime projection bridge | Service token accepted by Workspace admin APIs. Browser never receives it. |
| `ADMIN_CONVEX_SERVICE_TOKEN` | Convex real-data mode | Dedicated token accepted by Workspace Convex admin functions. Do not reuse `WORKSPACE_ADMIN_SERVICE_TOKEN`. |

Generate a password hash with:

```bash
node -e "console.log(require('node:crypto').createHash('sha256').update(process.argv[1]).digest('hex'))" 'your-password'
```

Set values in local `.env.local` and in the Admin Review Vercel project. Never
commit the service token value.

See:

- [Environment variables](../../docs/ENVIRONMENT.md)
- [Setup and configuration](../../SETUP_AND_CONFIGURATION.md)

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run typecheck
npm test
```

From the repository root:

```bash
npm --workspace @qentrah/admin-review run typecheck
npm --workspace @qentrah/admin-review test
```

## Related Documentation

- [Root README](../../README.md)
- [Architecture](../../docs/ARCHITECTURE.md)
- [Apps and packages](../../docs/APPS.md)
- [Feature lifecycle](../../docs/FEATURE_LIFECYCLE.md)
