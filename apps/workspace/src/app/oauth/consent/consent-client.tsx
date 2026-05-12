"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { getOAuthCopy } from "../oauth-copy";
import type { OAuthLocale } from "../oauth-locale";

type BetterAuthOrganization = { id: string; name: string };
type AuthResult<T> = { data?: T | null; error?: { message?: string; code?: string } | null };
type OAuthAuthClient = typeof authClient & {
  oauth2: {
    consent: (input: { accept: boolean; scope?: string }) => Promise<AuthResult<{ redirect: boolean; url: string }>>;
  };
};

const oauthClient = authClient as OAuthAuthClient;

function scopesFromSearch() {
  if (typeof window === "undefined") return [];
  return (new URLSearchParams(window.location.search).get("scope") ?? "")
    .split(/\s+/)
    .filter(Boolean);
}

export function OAuthConsentClient({ locale }: { locale: OAuthLocale }) {
  const copy = getOAuthCopy(locale);
  const activeOrganization = authClient.useActiveOrganization();
  const organization = activeOrganization.data as BetterAuthOrganization | null | undefined;
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [scopes, setScopes] = useState<string[]>([]);
  const [clientId, setClientId] = useState("");
  const partnerScopes = scopes.filter((scope) => scope.includes(":"));
  const organizationName = organization?.name ?? copy.fallbackOrganization;

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setScopes(scopesFromSearch());
    setClientId(searchParams.get("client_id") ?? "");
  }, []);

  async function submitConsent(accept: boolean) {
    setBusy(true);
    setError("");
    try {
      if (accept && organization?.id) {
        const response = await fetch(`/api/v1/organizations/${encodeURIComponent(organization.id)}/partner-connections`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ oauthClientId: clientId, scopes: partnerScopes }),
        });
        const payload = await response.json().catch(() => null) as { error?: string } | null;
        if (!response.ok) throw new Error(payload?.error ?? copy.connectionError);
      }

      const result = await oauthClient.oauth2.consent({
        accept,
        scope: scopes.join(" "),
      });
      if (result.error || !result.data?.url) {
        throw new Error(result.error?.message ?? result.error?.code ?? copy.consentError);
      }
      window.location.assign(result.data.url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : copy.consentError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10 text-zinc-950">
      <section className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{copy.eyebrow}</p>
        <h1 className="mt-3 text-2xl font-black tracking-tight">{copy.consentTitle}</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          {copy.consentDescription.replace("{organization}", organizationName)}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {partnerScopes.map((scope) => (
            <span key={scope} className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-600">
              {scope}
            </span>
          ))}
        </div>
        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => submitConsent(true)}
            disabled={busy || !organization?.id || partnerScopes.length === 0}
            className="rounded-xl bg-zinc-950 px-5 py-3 text-xs font-black uppercase tracking-widest text-white disabled:opacity-50"
          >
            {copy.authorize}
          </button>
          <button
            type="button"
            onClick={() => submitConsent(false)}
            disabled={busy}
            className="rounded-xl border border-zinc-200 px-5 py-3 text-xs font-black uppercase tracking-widest text-zinc-700 disabled:opacity-50"
          >
            {copy.deny}
          </button>
        </div>
        {error ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      </section>
    </main>
  );
}
