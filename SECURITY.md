# Security policy

## Supported versions

Qentrah is under active development and has not published a stable open-source
release. Security fixes currently target the latest revision of `main` only.

## Reporting a vulnerability

Do not disclose vulnerabilities in public issues, discussions, pull requests,
or chat channels. Use GitHub's private vulnerability reporting flow for this
repository:

<https://github.com/Up-to-code/qentrah/security/advisories/new>

Include the affected component, impact, reproduction steps, and any suggested
mitigation. Remove credentials, customer data, and unnecessary personal data
from the report. Maintainers should acknowledge a report within five business
days and coordinate disclosure after a fix or mitigation is available.

If private vulnerability reporting is unavailable, do not publish the details.
Contact a repository owner through a private channel and ask for a secure
reporting path.

## Scope

Reports about authentication, tenant isolation, Organization/Space/Project
authorization, MCP or Eve tool scope, billing integrity, secret exposure, and
stored or reflected content injection are especially important. Third-party
service outages, social engineering, and attacks requiring access to a victim's
already-unlocked device are generally outside scope unless they expose a Qentrah
security boundary.
