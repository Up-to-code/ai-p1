# Changes

## 2026-07-13 — Canonical lifecycle cutover

- Extracted lifecycle and presentation Modules from mixed read/write registration files.
- Centralized audit and webhook effects for public and internal callers.
- Added a strict writable patch contract and removed create-shaped update validation.
- Removed Eve's pre-update read/full-record merge.
- Added omission-safe PII patch protection and focused tests.
