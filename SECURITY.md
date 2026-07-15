# Security policy

## Supported versions

Qentrah has not published a stable source-available release. Security fixes
currently target the latest revision of `main` only.

## Reporting a vulnerability

Do not disclose vulnerabilities in public issues, discussions, pull requests,
or community channels. Use GitHub private vulnerability reporting at
<https://github.com/Up-to-code/qentrah/security/advisories/new> or email
[legal@qentrah.com](mailto:legal@qentrah.com).

Include the affected component, impact, reproduction steps, and suggested
mitigation. Remove credentials, customer data, and unnecessary personal data.
Maintainers aim to acknowledge reports within five business days and will
coordinate disclosure after a fix or mitigation is available.

If GitHub private reporting is unavailable, use email and do not publish the
details.

## Scope

Authentication, tenant isolation, Organization/Space/Project authorization,
MCP or Eve scope, billing integrity, secret exposure, and stored or reflected
content injection are especially important. Third-party outages, social
engineering, and attacks requiring an already-unlocked victim device are
generally outside scope unless they expose a Qentrah security boundary.
