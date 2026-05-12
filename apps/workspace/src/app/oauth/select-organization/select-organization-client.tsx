"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { getOAuthCopy } from "../oauth-copy";
import type { OAuthLocale } from "../oauth-locale";

type BetterAuthOrganization = { id: string; name: string };
type AuthResult<T> = { data?: T | null; error?: { message?: string; code?: string } | null };
type OAuthAuthClient = typeof authClient & {
  organization: {
    setActive: (input: { organizationId: string }) => Promise<AuthResult<unknown>>;
  };
  oauth2: {
    continue: (input: { postLogin: true }) => Promise<AuthResult<{ redirect: boolean; url: string }>>;
  };
};

const oauthClient = authClient as OAuthAuthClient;

export function OAuthSelectOrganizationClient({ locale }: { locale: OAuthLocale }) {
  const copy = getOAuthCopy(locale);
  const organizationsQuery = authClient.useListOrganizations();
  const organizations = (organizationsQuery.data ?? []) as BetterAuthOrganization[];
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  async function chooseOrganization(organizationId: string) {
    setBusyId(organizationId);
    setError("");
    try {
      const active = await oauthClient.organization.setActive({ organizationId });
      if (active.error) throw new Error(active.error.message ?? active.error.code ?? copy.organizationError);
      const continued = await oauthClient.oauth2.continue({ postLogin: true });
      if (continued.error || !continued.data?.url) {
        throw new Error(continued.error?.message ?? continued.error?.code ?? copy.continueError);
      }
      window.location.assign(continued.data.url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : copy.continueError);
    } finally {
      setBusyId("");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10 text-zinc-950">
      <section className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{copy.eyebrow}</p>
        <h1 className="mt-3 text-2xl font-black tracking-tight">{copy.chooseTitle}</h1>
        <div className="mt-6 space-y-3">
          {organizationsQuery.isPending ? <p className="text-sm text-zinc-500">{copy.loadingOrganizations}</p> : null}
          {!organizationsQuery.isPending && organizations.length === 0 ? (
            <p className="text-sm text-zinc-500">{copy.noOrganizations}</p>
          ) : null}
          {organizations.map((organization) => (
            <button
              key={organization.id}
              type="button"
              onClick={() => chooseOrganization(organization.id)}
              disabled={Boolean(busyId)}
              className="flex w-full items-center justify-between rounded-xl border border-zinc-200 px-4 py-3 text-start text-sm font-bold transition hover:bg-zinc-50 disabled:opacity-60"
            >
              <span>{organization.name}</span>
              <span className="text-xs uppercase tracking-widest text-zinc-400">
                {busyId === organization.id ? copy.selecting : copy.choose}
              </span>
            </button>
          ))}
        </div>
        {error ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      </section>
    </main>
  );
}
