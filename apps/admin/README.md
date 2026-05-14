# Qentrah Admin Review App

Admin Review is the internal Next.js console for reviewing partner app
submissions. It does not own the primary partner app data model. It reads and
writes review state through Workspace service APIs.

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

- List partner app submissions that need review.
- Show partner app details, requested scopes, redirect URIs, and status.
- Approve, reject, or suspend submissions through Workspace admin APIs.
- Keep internal review UI separate from the partner-facing Partners portal.

## Important Routes And Files

| Path | Purpose |
| --- | --- |
| `app/page.tsx` | Review queue page |
| `app/apps/[appId]/page.tsx` | Review detail page |
| `app/layout.tsx` | App shell and metadata |
| `lib/workspace.ts` | Workspace admin service API client |
| `lib/config.ts` | Required environment loading |
| `lib/*.test.ts` | Admin service client and config tests |

## Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `WORKSPACE_API_BASE_URL` | Yes | Workspace origin, for example `http://localhost:3000` |
| `WORKSPACE_ADMIN_SERVICE_TOKEN` | Yes | Service token accepted by Workspace admin APIs |

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
