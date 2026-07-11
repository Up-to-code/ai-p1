"use client";

import { useState } from "react";
import {
  ArrowRight,
  Building2,
  Check,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { BrandMark } from "@/components/logo";
import { authClient } from "@/lib/auth-client";
import { formatTemplate, getOAuthCopy } from "../oauth-copy";
import type { OAuthLocale } from "../oauth-locale";

type BetterAuthOrganization = { id: string; name: string };
type AuthResult<T> = {
  data?: T | null;
  error?: { message?: string; code?: string } | null;
};
type OAuthAuthClient = typeof authClient & {
  organization: {
    setActive: (input: {
      organizationId: string;
    }) => Promise<AuthResult<unknown>>;
  };
  oauth2: {
    continue: (input: {
      selected: true;
      oauth_query?: string;
    }) => Promise<AuthResult<{ redirect: boolean; url: string }>>;
  };
};

const oauthClient = authClient as OAuthAuthClient;

function oauthQuery() {
  if (typeof window === "undefined") return undefined;
  const query = window.location.search.slice(1);
  return query || undefined;
}

export function OAuthSelectOrganizationClient({
  locale,
}: {
  locale: OAuthLocale;
}) {
  const copy = getOAuthCopy(locale);
  const organizationsQuery = authClient.useListOrganizations();
  const organizations = (organizationsQuery.data ??
    []) as BetterAuthOrganization[];
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  async function chooseOrganization(organizationId: string) {
    setBusyId(organizationId);
    setError("");
    try {
      const active = await oauthClient.organization.setActive({
        organizationId,
      });
      if (active.error)
        throw new Error(
          active.error.message ?? active.error.code ?? copy.organizationError,
        );
      const continued = await oauthClient.oauth2.continue({
        selected: true,
        oauth_query: oauthQuery(),
      });
      if (continued.error || !continued.data?.url) {
        throw new Error(
          continued.error?.message ??
            continued.error?.code ??
            copy.continueError,
        );
      }
      window.location.assign(continued.data.url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : copy.continueError);
    } finally {
      setBusyId("");
    }
  }

  return (
    <main
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="min-h-screen bg-muted/30 text-foreground"
    >
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl border border-border bg-background shadow-sm">
            <BrandMark className="h-5 w-5" priority />
          </span>
          <span className="text-sm font-semibold tracking-tight">Qentrah</span>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <LockKeyhole className="size-3.5" aria-hidden="true" />
          {copy.oauthProtected}
        </span>
      </header>

      <div className="mx-auto flex max-w-6xl items-start justify-center px-5 pb-12 pt-8 sm:px-8 sm:pt-16">
        <section className="w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-background shadow-xl shadow-foreground/5">
          <div className="border-b border-border px-6 py-7 sm:px-9 sm:py-9">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-semibold text-muted-foreground">
              <ShieldCheck
                className="size-3.5 text-foreground"
                aria-hidden="true"
              />
              {copy.chooseEyebrow}
            </span>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
              {copy.chooseTitle}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              {copy.chooseDescription}
            </p>
          </div>

          <div className="px-6 py-6 sm:px-9 sm:py-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {copy.workspaceLabel}
            </p>
            {organizationsQuery.isPending ? (
              <div className="flex min-h-32 items-center justify-center gap-2 rounded-2xl border border-border bg-muted/30 text-sm font-medium text-muted-foreground">
                <LoaderCircle
                  className="size-4 animate-spin"
                  aria-hidden="true"
                />
                {copy.loadingOrganizations}
              </div>
            ) : null}
            {!organizationsQuery.isPending && organizations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
                <KeyRound
                  className="mx-auto h-6 w-6 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="mt-3 text-sm font-semibold leading-6 text-muted-foreground">
                  {copy.noOrganizations}
                </p>
                <a
                  href={`/${locale}/choose-org`}
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90"
                >
                  {copy.chooseTitle}
                </a>
              </div>
            ) : null}
            {organizations.length > 0 ? (
              <div className="space-y-3">
                {organizations.map((organization) => {
                  const isBusy = busyId === organization.id;
                  return (
                    <button
                      key={organization.id}
                      className="group flex w-full items-center gap-4 rounded-2xl border border-border bg-background p-4 text-start transition hover:border-foreground/25 hover:bg-muted/30 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60 sm:p-5"
                      disabled={Boolean(busyId)}
                      onClick={() => void chooseOrganization(organization.id)}
                      type="button"
                    >
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-foreground text-background shadow-sm">
                        {isBusy ? (
                          <LoaderCircle
                            className="size-5 animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <Building2 className="size-5" aria-hidden="true" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold sm:text-base">
                          {organization.name}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground sm:text-sm">
                          {isBusy
                            ? copy.selecting
                            : formatTemplate(copy.continueWith, {
                                organization: organization.name,
                              })}
                        </span>
                      </span>
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition group-hover:border-foreground group-hover:bg-foreground group-hover:text-background">
                        {isBusy ? (
                          <Check className="size-4" aria-hidden="true" />
                        ) : (
                          <ArrowRight
                            className="size-4 rtl:rotate-180"
                            aria-hidden="true"
                          />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}
            {error ? (
              <p className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
                {error}
              </p>
            ) : null}
          </div>

          <div className="flex gap-3 border-t border-border bg-muted/30 px-6 py-5 sm:px-9">
            <ShieldCheck
              className="mt-0.5 size-5 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold">
                {copy.chooseSecurityTitle}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
                {copy.chooseSecurityDescription}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
