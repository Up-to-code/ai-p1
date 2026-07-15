# Secret scan review

Status: blocked pending history sanitation, credential review, and rotation confirmation.

On 15 July 2026, Gitleaks 8.30.1 scanned all 437 reachable commits (approximately 740 MB) with redaction enabled. It reported 4,412 historical matches representing 118 unique file/line/rule combinations:

- most matches were repeated `token` fields in historical `.impeccable/live/` session and server records;
- remaining matches include configuration examples, test fixtures, dependency lockfile strings, and integration metadata that require classification rather than automatic dismissal; and
- the scan report is intentionally stored outside the repository because even a redacted report can expose sensitive history and repository structure.

Before publication:

1. Treat every historical `.impeccable/live/` token as potentially exposed and rotate or revoke any credential that could still be valid.
2. Remove `.impeccable` from all Git refs during the reviewed history rewrite and keep it untracked.
3. Classify each remaining unique finding as revoked, rotated, documented false positive, or unresolved.
4. Add narrow Gitleaks allowlist entries only for verified fixtures; do not allowlist whole source directories.
5. Re-run Gitleaks against the working tree and every rewritten ref with zero unresolved findings.
6. Record reviewer identity, scanner version, date, and sanitized result in this document.

This report does not claim that secrets are absent and does not authorize publication.
