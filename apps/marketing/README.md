# Qentrah Marketing

The Marketing application is the public, localized Qentrah website. Its content is owned in this repository and it has no standalone CMS runtime dependency.

## Responsibilities

- Public home, pricing, product, legal, and partner pages.
- English and Arabic content and metadata.
- Links into the Workspace application.
- Static sitemap and structured data for repository-owned routes.

Workspace data, authentication state, and private partner operations do not belong in this application.

## Development

```bash
npm run dev:marketing
npm --workspace @qentrah/marketing run typecheck
npm --workspace @qentrah/marketing run build
```

The development server uses port `3005`.
