# Convex Runtime Folder

Purpose: Keeps the Convex runtime folder present in the repository before the first interactive Convex initialization.

This folder is intentionally separate from `docs/`. The documentation explains the architecture; this folder will hold the actual Convex backend files once the app is initialized.

## Why This File Exists

Git does not keep empty folders. This `README.md` makes `workspace/convex/` persistent until `npx convex dev` creates the generated runtime files.

## Initialization

Run Convex initialization from the workspace app root:

```sh
cd workspace
npx convex dev
```

Per the Convex CLI and Next.js quickstart documentation, `npx convex dev` will:

- Prompt for login or project setup when needed.
- Create or reuse the `convex/` directory.
- Write local deployment configuration to `.env.local`.
- Generate app-specific files under `convex/_generated/`.
- Watch Convex functions and schema changes while it is running.

Do not commit `.env.local` or any secret-bearing environment file.

## What Belongs Here

After initialization, this folder should contain Convex runtime source such as:

- `schema.ts` for the app database schema.
- Query files for authorized reads.
- Mutation files for validated writes and audit-producing state changes.
- Action files for external I/O, webhooks, retries, and integrations.
- `http.ts` for Convex HTTP routes when needed.
- `_generated/` files produced by Convex code generation.

## What Does Not Belong Here

- Broad product specifications.
- Business architecture notes.
- UI documentation.
- OAuth, SDK, compliance, or visibility explanations unless they are executable Convex code.
- Secrets, raw tokens, API keys, client secrets, or real personal data.

Use these documentation locations instead:

- `docs/architecture/convex/` for Convex runtime boundaries.
- `docs/data-model/convex-schema/` for schema rules, validators, indexes, and versioning.
- `docs/auth/`, `docs/security/`, and `docs/compliance/` for protected auth, secret, and regulatory behavior.

## First Implementation Rule

Keep policy decisions in domain helpers where possible. Convex functions should orchestrate authorization, validation, persistence, synchronization, and audit records without hiding broad business policy inline.

## Official References

- Convex Next.js quickstart: https://docs.convex.dev/quickstart/nextjs
- Convex CLI: https://docs.convex.dev/cli
- Convex generated code: https://docs.convex.dev/generated-api
