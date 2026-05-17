"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Building2, CheckCircle2, KeyRound } from "lucide-react";
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
    <main dir={locale === "ar" ? "rtl" : "ltr"} className="flex min-h-screen items-center justify-center bg-[#eef2f5] px-4 py-10 text-[#111827]">
      <section className="w-full max-w-[470px] overflow-hidden rounded-[14px] border border-[#d9dee6] bg-[#fbfbfc] shadow-none">
        <div className="border-b border-[#e4e7ec] px-6 py-7 text-center sm:px-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[12px] border border-[#d9dee6] bg-[#111827]">
            <Image src="/brand-logo-white.svg" alt="Qentrah" width={28} height={28} className="h-7 w-7" priority />
          </div>
          <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-[#667085]">{copy.eyebrow}</p>
          <h1 className="mt-2 text-[22px] font-black leading-7 tracking-normal">{copy.chooseTitle}</h1>
          <p className="mx-auto mt-2 max-w-[320px] text-sm font-medium leading-6 text-[#667085]">{copy.chooseDescription}</p>
        </div>
        <div className="px-5 py-5 sm:px-8">
          {organizationsQuery.isPending ? (
            <div className="flex min-h-28 items-center justify-center rounded-[12px] border border-[#e4e7ec] bg-white text-sm font-semibold text-[#667085]">
              {copy.loadingOrganizations}
            </div>
          ) : null}
          {!organizationsQuery.isPending && organizations.length === 0 ? (
            <div className="rounded-[12px] border border-[#e4e7ec] bg-white p-5 text-center">
              <KeyRound className="mx-auto h-6 w-6 text-[#98a2b3]" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold leading-6 text-[#667085]">{copy.noOrganizations}</p>
            </div>
          ) : null}
          <div className="space-y-2">
            {organizations.map((organization) => (
              <button
                key={organization.id}
                type="button"
                onClick={() => chooseOrganization(organization.id)}
                disabled={Boolean(busyId)}
                className="flex w-full items-center gap-3 rounded-[12px] border border-[#e4e7ec] bg-white px-3 py-3 text-start transition hover:border-[#cfd6df] hover:bg-[#f8fafc] disabled:opacity-60"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#f0f2f5] text-[#344054]">
                  {busyId === organization.id ? <CheckCircle2 className="h-5 w-5 text-[#3246bd]" aria-hidden="true" /> : <Building2 className="h-5 w-5" aria-hidden="true" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-black text-[#111827]">{organization.name}</span>
                  <span className="mt-0.5 block text-xs font-semibold text-[#667085]">{busyId === organization.id ? copy.selecting : copy.choose}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-[#98a2b3] rtl:rotate-180" aria-hidden="true" />
              </button>
            ))}
          </div>
          {error ? <p className="mt-4 rounded-[10px] bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}
        </div>
      </section>
    </main>
  );
}
