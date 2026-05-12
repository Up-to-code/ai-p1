import { BookOpen, CheckCircle2, Code2, KeyRound, ShieldCheck, Workflow } from "lucide-react";

export const oauthFlowSteps = [
  { label: "Register", text: "Create a public PKCE or confidential app in the portal." },
  { label: "Connect", text: "Use explicit Anan workspace authorization to verify scopes and redirects." },
  { label: "Review", text: "Submit the app for security and UX review." },
  { label: "Launch", text: "Enable trusted workspace access after approval." },
] as const;

export const portalFeatures = [
  {
    title: "OAuth-first authorization",
    description: "Use standards-based authorization code + PKCE, OIDC claims, scoped API access, and secure token handling.",
    icon: Workflow,
  },
  {
    title: "Review-ready app registry",
    description: "Track redirect URIs, allowed scopes, client type, lifecycle state, and review notes in one place.",
    icon: CheckCircle2,
  },
  {
    title: "SDKs and docs together",
    description: "Install @anan/auth-sdk, wire callbacks, verify tokens, and call APIs from the same documentation surface.",
    icon: BookOpen,
  },
  {
    title: "Tenant-safe by default",
    description: "Every app connects to Anan workspaces only through explicit consent and scoped access.",
    icon: ShieldCheck,
  },
];

export const dashboardMetrics = [
  { label: "OAuth app lifecycle", value: "4 stages" },
  { label: "SDK install path", value: "@anan/auth-sdk" },
  { label: "Token model", value: "OIDC + scopes" },
];

export const sdkInstallSnippet = `pnpm add @anan/auth-sdk

import { createOidcClient } from "@anan/auth-sdk/client";

export const anan = createOidcClient({
  issuer: process.env.ANAN_ISSUER!,
  clientId: process.env.ANAN_CLIENT_ID!,
  redirectUri: "/oauth/callback",
});`;

export const quickStartCards = [
  { title: "Create credentials", description: "Register an app and store the generated client ID.", icon: KeyRound },
  { title: "Add the SDK", description: "Use @anan/auth-sdk for browser PKCE and server verification helpers.", icon: Code2 },
  { title: "Request review", description: "Submit the tested app and review notes before production access.", icon: ShieldCheck },
] as const;
