"use client";

import { useState } from "react";
import { ArrowRight, Building2, CheckCircle2, KeyRound } from "lucide-react";
import { BrandMark } from "@/components/logo";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authClient } from "@/lib/auth-client";
import { getOAuthCopy } from "../oauth-copy";
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
      postLogin: true;
    }) => Promise<AuthResult<{ redirect: boolean; url: string }>>;
  };
};

const oauthClient = authClient as OAuthAuthClient;

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
      const continued = await oauthClient.oauth2.continue({ postLogin: true });
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
      className="flex min-h-screen flex-col bg-[var(--q-bg)] text-foreground"
    >
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-6">
        <BrandMark className="h-6 w-6" priority />
        <span className="text-sm font-semibold tracking-tight">qentrah</span>
      </header>
      <div className="shrink-0 border-b border-border px-6 py-4">
        <h1 className="text-lg font-semibold text-foreground">
          {copy.chooseTitle}
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {copy.chooseDescription}
        </p>
      </div>
      <div className="flex-1 overflow-auto bg-[var(--q-bg)]">
        <section className="mx-6 mt-6 max-w-5xl">
          {organizationsQuery.isPending ? (
            <div className="flex min-h-28 items-center justify-center rounded-xl border border-border bg-card text-sm font-semibold text-muted-foreground">
              {copy.loadingOrganizations}
            </div>
          ) : null}
          {!organizationsQuery.isPending && organizations.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <KeyRound
                className="mx-auto h-6 w-6 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="mt-3 text-sm font-semibold leading-6 text-muted-foreground">
                {copy.noOrganizations}
              </p>
              <a
                href={`/${locale}/choose-org`}
                className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-foreground px-4 text-sm font-medium text-background transition hover:opacity-90"
              >
                {copy.chooseTitle}
              </a>
            </div>
          ) : null}
          {organizations.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Organization</TableHead>
                    <TableHead className="w-32 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizations.map((organization) => (
                    <TableRow
                      key={organization.id}
                      className="cursor-pointer"
                      onClick={() => chooseOrganization(organization.id)}
                    >
                      <TableCell>
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            {busyId === organization.id ? (
                              <CheckCircle2
                                className="size-4 text-primary"
                                aria-hidden="true"
                              />
                            ) : (
                              <Building2
                                className="size-4"
                                aria-hidden="true"
                              />
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-foreground">
                              {organization.name}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {busyId === organization.id
                                ? copy.selecting
                                : copy.choose}
                            </span>
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-60"
                          disabled={Boolean(busyId)}
                          onClick={(event) => {
                            event.stopPropagation();
                            void chooseOrganization(organization.id);
                          }}
                          type="button"
                        >
                          <ArrowRight
                            className="size-3.5 rtl:rotate-180"
                            aria-hidden="true"
                          />
                          <span className="sr-only">{copy.choose}</span>
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : null}
          {error ? (
            <p className="mt-4 border-s-2 border-destructive px-3 py-2 text-sm font-semibold text-destructive">
              {error}
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
