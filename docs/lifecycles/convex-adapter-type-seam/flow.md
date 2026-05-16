# Flow

Current flow:
1. Server-domain services obtain or construct Convex function references.
2. Services call app-local Convex HTTP helpers or shared repository helpers.
3. Some helpers hide generated-reference typing with repeated casts.

Target flow:
1. Domain services define the query/mutation/action result and args at the call site.
2. Shared Convex Adapter helpers localize generated-reference casts.
3. Domain Modules receive typed values without repeating Convex transport details.

Current implementation:
1. `createConvexHttpCalls` creates typed `query`, `mutation`, and `action` call helpers over an app-local `ConvexHttpClient`.
2. Workspace exports `convexCalls` beside the raw client.
3. Touched partner/security services use `convexCalls` for runtime sync, partner access validation, organization API key validation, and resource bridge calls.
