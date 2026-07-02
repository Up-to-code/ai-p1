// TODO: Re-enable when apiKeys component is properly generated
// import { ApiKeys } from "convex-api-keys";
// import { components } from "./_generated/api";

// export const apiKeys = new ApiKeys<{
//   namespace: `organization:${string}`;
//   requireName: true;
//   metadata:
//     | {
//         kind: "mcpConnection";
//         organizationId: string;
//         principalType?: "user" | "organization";
//         principalUserId?: string;
//         connectionId?: string;
//       }
//     | { kind: "orgApiKey"; organizationId: string; apiKeyId: string };
//   permissions: Record<string, string[]>;
// }>(components.apiKeys, {
//   keyDefaults: {
//     prefix: "qentrah_mcp_",
//     keyLengthBytes: 32,
//     ttlMs: null,
//     idleTimeoutMs: 30 * 24 * 60 * 60 * 1000,
//   },
//   logLevel: "warn",
// });

export const apiKeys = null as any;
