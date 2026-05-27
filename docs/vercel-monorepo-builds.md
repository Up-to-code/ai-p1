# Vercel Monorepo Builds

Each Vercel project uses `scripts/vercel-ignore.mjs` as its ignored build step.

Vercel skips a build when the script exits `0`, and builds when the script exits `1`.

## Why Every Project Built Once

The commit that introduced this setup changed every app's `vercel.json`.
That makes every Vercel project affected for that commit, so the first deployment after adding the ignore commands is expected to build all projects once.

After that deployment, unrelated app changes should skip.

## Local Checks

Check whether the workspace project would build for the latest commit:

```bash
node scripts/vercel-ignore.mjs --workspace @qentrah/workspace --base HEAD~1 --head HEAD --dry-run
```

Check the other web projects:

```bash
node scripts/vercel-ignore.mjs --workspace @qentrah/partners --base HEAD~1 --head HEAD --dry-run
node scripts/vercel-ignore.mjs --workspace @qentrah/admin-review --base HEAD~1 --head HEAD --dry-run
node scripts/vercel-ignore.mjs --workspace @qentrah/marketing --base HEAD~1 --head HEAD --dry-run
```

The output explains whether the app is building or skipping and lists relevant changed files when it builds.

## Watched Changes

An app builds when a commit changes:

- The app directory.
- A local `@qentrah/*` package that the app depends on, including transitive dependencies.
- Root dependency/config files such as `package.json`, `package-lock.json`, `vercel.json`, `.npmrc`, `.node-version`, or `tsconfig.json`.
- `scripts/vercel-ignore.mjs`.

This keeps builds conservative: shared dependency changes build affected apps, while unrelated app-only changes skip the rest.
