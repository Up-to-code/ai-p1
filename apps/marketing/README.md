# Qentrah Marketing App

Marketing is the public website app. It is deployed separately from Workspace,
Partners, Admin Review, and the Demo Partner App.

## Local Development

From the repository root:

```bash
npm run dev:marketing
```

From this app folder:

```bash
npm run dev
```

Default local URL: `http://localhost:3005`.

## Responsibilities

- Public homepage and localized homepage.
- Public privacy and terms pages.
- Public marketing copy and navigation.
- No dependency on private Workspace or Partners runtime state.

## Important Routes And Files

| Path | Purpose |
| --- | --- |
| `app/page.tsx` | Default homepage |
| `app/[locale]/page.tsx` | Localized homepage |
| `app/privacy/page.tsx` | Default privacy page |
| `app/terms/page.tsx` | Default terms page |
| `app/[locale]/privacy/page.tsx` | Localized privacy page |
| `app/[locale]/terms/page.tsx` | Localized terms page |
| `app/layout.tsx` | Root layout |
| `app/[locale]/layout.tsx` | Localized layout |

## Environment

No required private integration token is documented for this app at the repo
level. Add new variables to [Environment variables](../../docs/ENVIRONMENT.md)
and [Setup and configuration](../../SETUP_AND_CONFIGURATION.md) when the app
gains runtime integrations.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run typecheck
```

From the repository root:

```bash
npm --workspace @anan/marketing run typecheck
```

## Related Documentation

- [Root README](../../README.md)
- [Apps and packages](../../docs/APPS.md)
- [Feature lifecycle](../../docs/FEATURE_LIFECYCLE.md)
