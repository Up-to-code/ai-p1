# Risks

- The secret is shown once; do not persist or re-render old key values after modal close.
- The URL must be derived from the current Workspace origin so local, preview, and production environments work.
- Copying the key should still copy only the secret unless a separate copy-request button is added.
