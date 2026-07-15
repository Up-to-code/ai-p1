# Setup and configuration

Install dependencies from the repository root, then configure only the app you
are running. Workspace development uses `apps/workspace/.env.local`; Marketing
uses `apps/marketing/.env.local`. Both files are ignored and must never be
committed.

See [Production environment](environment.md) for runtime ownership, required
production variables, and the Dodo/Convex webhook boundary.
