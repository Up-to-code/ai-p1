// Keep mobile-side Convex references untyped so the app can depend on a synced
// local copy of Convex's generated client surface without pulling in the full
// backend declaration graph during React Native typecheck.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const generatedApi = require("./_generated/api.js");

export const api = generatedApi.api as any;
