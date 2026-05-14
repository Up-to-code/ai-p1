"use client";

import { useState } from "react";
import { Check, Clipboard, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const agentImplementationPrompt = String.raw`You are implementing a Qentrah partner integration in an existing web app.

Goal:
- Add organization-level OAuth with Qentrah.
- Keep all token exchange, token refresh, and token storage on the server.
- Add a frontend button with the exact copy: "Authorize with Qentrah".
- After authorization, call Qentrah Workspace partner APIs for organization, clients, and properties.

Use these existing environment variables:
- QENTRAH_WORKSPACE_API_URL: Qentrah Workspace base URL, for example http://localhost:3000 locally or the hosted Qentrah workspace URL in production
- QENTRAH_CLIENT_ID: approved OAuth client id from Qentrah Partners
- QENTRAH_CLIENT_SECRET: optional; use only for confidential server apps
- PARTNER_APP_URL: public URL of this partner app
- SESSION_SECRET: at least 32 characters if this app stores an encrypted session cookie

OAuth requirements:
- Use OAuth 2.1 authorization code flow with PKCE.
- Generate a random state value and PKCE verifier on the server.
- Store state and verifier in HttpOnly, SameSite=Lax, short-lived cookies or an equivalent server session.
- Redirect users to {QENTRAH_WORKSPACE_API_URL}/oauth/authorize with:
  - response_type=code
  - client_id={QENTRAH_CLIENT_ID}
  - redirect_uri={PARTNER_APP_URL}/api/auth/anan/callback
  - scope=organization:read client:read property:read offline_access
  - resource={QENTRAH_WORKSPACE_API_URL}/api/v1/partner
  - state=<random state>
  - code_challenge=<S256 challenge>
  - code_challenge_method=S256
- In the callback route, validate state before exchanging the code.
- Exchange the code on the backend at {QENTRAH_WORKSPACE_API_URL}/oauth/token with:
  - grant_type=authorization_code
  - client_id={QENTRAH_CLIENT_ID}
  - client_secret={QENTRAH_CLIENT_SECRET}, only when present
  - redirect_uri={PARTNER_APP_URL}/api/auth/anan/callback
  - code=<authorization code>
  - code_verifier=<stored PKCE verifier>
  - resource={QENTRAH_WORKSPACE_API_URL}/api/v1/partner
- Require tokens.organization_id in the token response.

Frontend:
- Add an accessible button or link labeled "Authorize with Qentrah".
- The button should navigate to the server route that starts OAuth, for example /api/auth/anan/start.
- Do not expose access tokens, refresh tokens, client secrets, or authorization codes to browser JavaScript.

Backend Workspace API client:
- Store tokens server-side, keyed by organization_id.
- Send access tokens only in backend Authorization headers.
- Call:
  - GET {QENTRAH_WORKSPACE_API_URL}/api/v1/partner/organizations/{organizationId}/me
  - GET {QENTRAH_WORKSPACE_API_URL}/api/v1/partner/organizations/{organizationId}/clients
  - GET {QENTRAH_WORKSPACE_API_URL}/api/v1/partner/organizations/{organizationId}/properties
- Parse Workspace errors and handle these codes in product UI where possible:
  - missing_bearer
  - wrong_organization
  - app_not_approved
  - connection_not_found
  - connection_expired
  - scope_denied

Security rules:
- Never place Qentrah access tokens in localStorage, query params, browser logs, or client-rendered payloads.
- Never expose QENTRAH_CLIENT_SECRET to the browser.
- Request the smallest useful scope set for the feature.
- If refresh tokens are used, rotate/store them in a durable backend token vault or database.

Acceptance criteria:
- A user can click "Authorize with Qentrah", consent in Qentrah, and return to the partner app.
- The backend stores the organization id and tokens server-side.
- The app can load organization, clients, and properties through Workspace APIs.
- Missing/expired connection states prompt the user to authorize or reconnect.
- Typecheck and build pass.`;

type CopyState = "idle" | "copied" | "failed";

export function AgentPromptCopyCard() {
  const [copyState, setCopyState] = useState<CopyState>("idle");

  async function copyPrompt() {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API is not available.");
      }

      await navigator.clipboard.writeText(agentImplementationPrompt);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 2400);
    } catch {
      setCopyState("failed");
    }
  }

  const label = copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy failed" : "Copy AI agent prompt";
  const Icon = copyState === "copied" ? Check : copyState === "failed" ? X : Clipboard;

  return (
    <div className="not-prose my-6 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">AI agent starter</p>
          <h2 className="mt-2 text-xl font-semibold tracking-normal text-foreground">Copy a complete implementation brief</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Paste this into your coding agent to build the OAuth button, PKCE routes, server-side token exchange, env usage, and Workspace API reads.
          </p>
        </div>
        <Button type="button" onClick={copyPrompt} aria-live="polite" className="h-9 gap-2 self-start">
          <Icon className="h-4 w-4" aria-hidden="true" />
          {label}
        </Button>
      </div>
      {copyState === "failed" ? (
        <p className="mt-3 text-sm font-medium text-destructive">
          Clipboard access was blocked. Select the prompt text below and copy it manually.
        </p>
      ) : null}
      <details className="mt-4 rounded-md border border-border bg-muted/35">
        <summary className="cursor-pointer px-3 py-2 text-sm font-semibold text-foreground">Preview prompt</summary>
        <pre className="max-h-96 overflow-auto whitespace-pre-wrap px-3 pb-3 text-xs leading-5 text-muted-foreground">
          {agentImplementationPrompt}
        </pre>
      </details>
    </div>
  );
}
