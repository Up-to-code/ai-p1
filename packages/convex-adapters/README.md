# @anan/convex-adapters

Shared repository and generated API adapter helpers. Generated Convex imports stay
app-local; apps pass `api` and `internal` into these helpers.

Use `@anan/convex-adapters/api` for unsafe generated API ref adaptation and
`@anan/convex-adapters/repository` for token forwarding, optional-origin
payloads, public fetchers, and result unwrap helpers.
