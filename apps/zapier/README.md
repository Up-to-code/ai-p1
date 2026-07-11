# Qentrah for Zapier

Official Zapier Platform CLI app for Qentrah. It connects with an organization-scoped Qentrah API key and never stores a workspace session or user password.

## Available Zapier components

### Triggers

- New or Updated Task
- New or Updated Client
- New or Updated Document
- Project List (hidden helper for dynamic dropdowns)

### Actions

- Create Task
- Update Task
- Create Client
- Update Client
- Create Document
- Update Document

## Local development

Zapier Platform CLI 19 requires Node.js 18.20 or newer.

```bash
npm install
npm run build
npm test
npm run validate
```

For a local Qentrah server, run tests with `QENTRAH_BASE_URL=http://localhost:3000`. Production connections use `https://app.qentrah.com`; deployed overrides are configured with Zapier environment variables and must use HTTPS.

## Registering the private app

Registration requires an authenticated Zapier developer account:

```bash
zapier-platform login
zapier-platform register "Qentrah"
zapier-platform push
```

Do not commit `.zapierapprc`, `.env`, API keys, deploy keys, or authentication output.

## Required Qentrah API-key permissions

Grant only the permissions a Zap needs. The complete development connection generally uses:

- `organization:read`
- `project:read`
- `task:read`, `task:create`, `task:update`
- `client:read`, `client:create`, `client:update`
- `document:read`, `document:create`, `document:update`

API keys are sent only in the `Authorization: Bearer` header.
