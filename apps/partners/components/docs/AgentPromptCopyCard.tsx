"use client";

import { useState } from "react";
import { Check, Clipboard, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { qentrahAuthSdkJsdelivrUrl } from "@/lib/sdk-version";

const agentImplementationPrompt = String.raw`You are implementing a Qentrah partner integration in an existing web app.

Goal:
- Add organization-level OAuth with Qentrah.
- Keep all token exchange, token refresh, and token storage on the server.
- Use @qentrah/auth-sdk for the frontend button, OAuth routes, webhook route, and service-app API calls.
- After authorization, call Qentrah Workspace partner APIs for organization, clients, and properties.

Use these existing environment variables:
- QENTRAH_WORKSPACE_API_URL: Qentrah Workspace base URL, for example http://localhost:3000 locally or the hosted Qentrah workspace URL in production
- QENTRAH_CLIENT_ID: approved OAuth client id from Qentrah Partners
- QENTRAH_CLIENT_SECRET: optional; use only for confidential server apps
- PARTNER_APP_URL: public URL of this partner app
- SESSION_SECRET: at least 32 characters if this app stores an encrypted session cookie

SDK requirements:
- Install @qentrah/auth-sdk.
- Add a frontend button with the exact copy: "Authorize with Qentrah".
- For bundled apps, use mountQentrahAuthorizeButton from @qentrah/auth-sdk/partner/browser.
- For no-build HTML apps, load the pinned HTTPS script:
  ${qentrahAuthSdkJsdelivrUrl}
- The button should navigate to /api/qentrah/oauth/start.
- Add backend start and callback routes using createQentrahPartnerAuthHandlers from @qentrah/auth-sdk/partner/next.
- Implement sessionStore for pending state/PKCE using HttpOnly, SameSite=Lax, short-lived cookies or an equivalent server session.
- Implement tokenStore to save tokens server-side, keyed by organizationId.

Frontend:
- Add an accessible button or link labeled "Authorize with Qentrah".
- The button should navigate to the server route that starts OAuth, for example /api/qentrah/oauth/start.
- Do not expose access tokens, refresh tokens, client secrets, or authorization codes to browser JavaScript.

Backend Workspace API client:
- Use createQentrahServiceAppClient from @qentrah/auth-sdk/partner/service-app.
- Store tokens server-side, keyed by organizationId.
- Send access tokens only from backend code.
- Read clients with qentrah.read({ organizationId, resource: "client", input }).
- Write clients with qentrah.write({ organizationId, resource: "client", action, input, idempotencyKey }).
- Parse Workspace errors and handle these codes in product UI where possible:
  - missing_bearer
  - wrong_organization
  - app_not_approved
  - connection_not_found
  - connection_expired
  - scope_denied

Webhook route:
- Add a POST route using createQentrahWebhookHandler from @qentrah/auth-sdk/partner/webhooks.
- Use export const runtime = "nodejs" in Next.js.
- Verify webhooks before parsing JSON.
- Handle client.created, client.updated, and client.deleted events.

Security rules:
- Never place Qentrah access tokens in localStorage, query params, browser logs, or client-rendered payloads.
- Never expose QENTRAH_CLIENT_SECRET to the browser.
- Request the smallest useful scope set for the feature.
- If refresh tokens are used, rotate/store them in a durable backend token vault or database.

Acceptance criteria:
- A user can click "Authorize with Qentrah", consent in Qentrah, and return to the partner app.
- The backend stores the organization id and tokens server-side.
- The app can load organization, clients, and properties through Workspace APIs.
- The app can receive and verify Qentrah webhooks.
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

  const label = copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy failed" : "Copy system AI prompt";
  const Icon = copyState === "copied" ? Check : copyState === "failed" ? X : Clipboard;

  return (
    <div className="not-prose command-panel my-6 p-4 text-card-foreground">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase text-primary">System AI starter</p>
          <h2 className="mt-2 text-xl font-semibold tracking-normal text-foreground">Copy a complete implementation brief</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Paste this into your system AI operator to build the SDK button, backend routes, token storage, webhooks, env usage, and Workspace API reads.
          </p>
        </div>
        <Button type="button" onClick={copyPrompt} aria-live="polite" className="h-9 gap-2 self-start rounded-[6px] bg-primary text-primary-foreground hover:bg-primary/90">
          <Icon className="h-4 w-4" aria-hidden="true" />
          {label}
        </Button>
      </div>
      {copyState === "failed" ? (
        <p className="mt-3 text-sm font-medium text-destructive">
          Clipboard access was blocked. Select the prompt text below and copy it manually.
        </p>
      ) : null}
      <details className="mt-4 rounded-[6px] border border-border bg-muted/35">
        <summary className="cursor-pointer px-3 py-2 text-sm font-semibold text-foreground">Preview prompt</summary>
        <pre className="max-h-96 overflow-auto whitespace-pre-wrap px-3 pb-3 text-xs leading-5 text-muted-foreground">
          {agentImplementationPrompt}
        </pre>
      </details>
    </div>
  );
}
