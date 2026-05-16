# Risks

## Review Risk

- The tree contains broad uncommitted work, so cleanup must not assume every unknown change is accidental.
- Package-lock changes can mix unrelated package edits if manifests are not cleaned first.

## Runtime Risk

- Removing transition endpoints too early can break Admin or Partners callers.
- Reverting generated Next type references can fail if the current Next version requires dev type paths.

## Security Risk

- Local secret-manager config must not be committed.
- Error cleanup must not expose secrets or raw upstream payloads.

## Rollback

- Cleanup buckets should be independently reviewable.
- If a focused test fails after a cleanup bucket, revert only that bucket manually and keep unrelated work intact.
