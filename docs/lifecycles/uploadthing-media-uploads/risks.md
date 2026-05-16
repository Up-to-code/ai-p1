# Risks

## Secrets

- `UPLOADTHING_TOKEN`, `UPLOADTHING_SECRET`, and `UPLOADTHING_APP_ID` must not be logged. Diagnostics must describe shape problems without printing values.
- Vercel environment values should be stored without `.env` quote characters. Runtime normalization strips common copied quotes, but the stored secret should still be cleaned.

## Compatibility

- UploadThing v7 treats `UPLOADTHING_TOKEN` as the primary server credential. Old `UPLOADTHING_SECRET` and `UPLOADTHING_APP_ID` alone are not enough for this version.
- If a future UploadThing version changes token schema, the production env check must be updated with the package upgrade.

## Rollback

- Reverting the config helper returns to UploadThing's direct env parsing and may reintroduce quoted-token failures.

## Open Follow-Up

- If Vercel production has `UPLOADTHING_TOKEN` set to the raw `sk_...` API key instead of the base64 JSON token, code cannot infer `regions`; the Vercel variable must be corrected.
