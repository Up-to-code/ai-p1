"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowLeftRight,
  Bot,
  Building2,
  CheckCircle2,
  Home,
  KeyRound,
  RefreshCw,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { formatTemplate, getOAuthCopy } from "../oauth-copy";
import type { OAuthLocale } from "../oauth-locale";
import {
  createPartnerConnectionGrant,
  fetchPartnerCatalogApps,
} from "@/domains/integrations/integrations-runtime";

type BetterAuthOrganization = { id: string; name: string };
type PartnerCatalogApp = {
  id?: string;
  name?: string;
  publisherName?: string;
  partnersClientId?: string;
  homepageUrl?: string;
  logoUrl?: string;
};
type AuthResult<T> = {
  data?: T | null;
  error?: { message?: string; code?: string } | null;
};
type OAuthAuthClient = typeof authClient & {
  oauth2: {
    consent: (input: {
      accept: boolean;
      scope?: string;
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

const knownLocalApps: Record<string, PartnerCatalogApp> = {
  partners_client_j9d616X85tTR2oIEl59N94wk: {
    name: "Qentrah WhatsApp Services",
    publisherName: "Qentrah WhatsApp Services",
  },
};

const permissionMeta: Record<
  string,
  {
    icon: LucideIcon;
    en: string;
    ar: string;
    detailEn: string;
    detailAr: string;
  }
> = {
  "organization:read": {
    icon: Building2,
    en: "Organization profile",
    ar: "ملف المؤسسة",
    detailEn: "Read workspace identity and organization metadata.",
    detailAr: "قراءة هوية مساحة العمل وبيانات المؤسسة.",
  },
  "client:read": {
    icon: Users,
    en: "Clients",
    ar: "العملاء",
    detailEn: "Read client records connected to this workspace.",
    detailAr: "قراءة سجلات العملاء المرتبطة بمساحة العمل.",
  },
  "asset:read": {
    icon: Home,
    en: "Assets",
    ar: "الأصول",
    detailEn: "Read asset records and related workspace details.",
    detailAr: "قراءة سجلات الأصول والتفاصيل المرتبطة بمساحة العمل.",
  },
  "mcp:read": {
    icon: KeyRound,
    en: "Read workspace data",
    ar: "قراءة بيانات مساحة العمل",
    detailEn: "View the workspace data exposed to this MCP connection.",
    detailAr: "عرض بيانات مساحة العمل المتاحة لاتصال MCP هذا.",
  },
  "mcp:write": {
    icon: KeyRound,
    en: "Make workspace changes",
    ar: "إجراء تغييرات في مساحة العمل",
    detailEn: "Create and update workspace data through this MCP connection.",
    detailAr: "إنشاء وتحديث بيانات مساحة العمل عبر اتصال MCP هذا.",
  },
  offline_access: {
    icon: RefreshCw,
    en: "Stay securely connected",
    ar: "البقاء متصلاً بأمان",
    detailEn: "Keep this connection active without exposing credentials.",
    detailAr: "إبقاء هذا الاتصال نشطاً دون كشف بيانات الاعتماد.",
  },
};

function fallbackScopeLabel(scope: string) {
  return scope
    .split(":")
    .map((part) => part.replace(/[-_]/g, " "))
    .join(" ");
}

async function fetchPartnerApp(clientId: string) {
  return fetchPartnerCatalogApps()
    .then(
      (apps) => apps.find((app) => app.partnersClientId === clientId) ?? null,
    )
    .catch(() => null);
}

export function OAuthConsentClient({
  clientId,
  locale,
  scopes,
}: {
  clientId: string;
  locale: OAuthLocale;
  scopes: string[];
}) {
  const copy = getOAuthCopy(locale);
  const activeOrganization = authClient.useActiveOrganization();
  const organization = activeOrganization.data as
    BetterAuthOrganization | null | undefined;
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [partnerApp, setPartnerApp] = useState<PartnerCatalogApp | null>(null);
  const isArabic = locale === "ar";
  const direction = isArabic ? "rtl" : "ltr";
  const displayScopes = scopes.filter(
    (scope) => scope.includes(":") || scope === "offline_access",
  );
  const resourceScopes = scopes.filter((scope) => scope.includes(":"));
  const isMcpAuthorization = scopes.some((scope) => scope.startsWith("mcp:"));
  const organizationName = organization?.name ?? copy.fallbackOrganization;
  const appName =
    (isMcpAuthorization
      ? copy.mcpAppName
      : (partnerApp?.name ??
        (clientId ? knownLocalApps[clientId]?.name : undefined))) ??
    copy.fallbackApp;
  const consentTitle = formatTemplate(
    isMcpAuthorization ? copy.mcpConsentTitle : copy.consentTitle,
    {
      app: appName,
      organization: organizationName,
    },
  );
  const consentDescription = formatTemplate(
    isMcpAuthorization ? copy.mcpConsentDescription : copy.consentDescription,
    {
      app: appName,
      organization: organizationName,
    },
  );
  const permissionIntro = formatTemplate(
    isMcpAuthorization ? copy.mcpPermissionIntro : copy.permissionIntro,
    {
      app: appName,
      organization: organizationName,
    },
  );
  const trustNote = isMcpAuthorization ? copy.mcpTrustNote : copy.trustNote;
  const approveLabel = isMcpAuthorization
    ? copy.connectAgent
    : copy.allowAccess;

  useEffect(() => {
    if (!clientId || isMcpAuthorization) return;
    let active = true;
    fetchPartnerApp(clientId)
      .then((app) => {
        if (active && app) setPartnerApp(app);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [clientId, isMcpAuthorization]);

  async function submitConsent(accept: boolean) {
    setBusy(true);
    setError("");
    try {
      if (
        accept &&
        organization?.id &&
        partnerApp?.id &&
        partnerApp.partnersClientId
      ) {
        await createPartnerConnectionGrant(organization.id, {
          partnersAppId: partnerApp.id,
          partnersClientId: partnerApp.partnersClientId,
          scopes: resourceScopes,
        });
      }

      const result = await oauthClient.oauth2.consent({
        accept,
        scope: scopes.join(" "),
        oauth_query: oauthQuery(),
      });
      if (result.error || !result.data?.url) {
        throw new Error(
          result.error?.message ?? result.error?.code ?? copy.consentError,
        );
      }
      window.location.assign(result.data.url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : copy.consentError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      dir={direction}
      className="flex min-h-screen items-center justify-center bg-[#eef2f5] px-4 py-8 text-[#111827] sm:px-6"
    >
      <section className="w-full max-w-[470px] overflow-hidden rounded-[12px] border border-[#d9dee6] bg-[#fbfbfc] shadow-none">
        <div className="relative border-b border-[#e4e7ec] px-5 pb-5 pt-8 sm:px-8">
          <button
            type="button"
            onClick={() => submitConsent(false)}
            disabled={busy}
            aria-label={copy.cancel}
            className="absolute end-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-transparent text-[#8a94a3] transition hover:border-[#d9dee6] hover:bg-white hover:text-[#111827] disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="flex items-center justify-center gap-3">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[12px] border border-[#d9dee6] bg-[#111827]">
              <Image
                src="/brand-logo-white.svg"
                alt="Qentrah"
                width={28}
                height={28}
                className="h-7 w-7"
                priority
              />
            </span>
            <span className="flex h-8 w-8 items-center justify-center text-[#9aa3af]">
              <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-[#d9dee6] bg-white">
              {isMcpAuthorization ? (
                <Bot
                  className="h-6 w-6 text-[var(--q-accent)]"
                  aria-hidden="true"
                />
              ) : partnerApp?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={partnerApp.logoUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <KeyRound
                  className="h-6 w-6 text-[var(--q-accent)]"
                  aria-hidden="true"
                />
              )}
            </span>
          </div>

          <div className="mx-auto mt-5 max-w-[360px] text-center">
            <h1 className="text-[22px] font-black leading-7 tracking-normal text-[#111827]">
              {consentTitle}
            </h1>
            <p className="mt-2 text-sm font-medium leading-6 text-[#4b5563]">
              {consentDescription}
            </p>
          </div>
        </div>

        <div className="px-5 py-5 sm:px-8">
          <h2 className="text-sm font-black text-[#111827]">
            {permissionIntro}
          </h2>

          <div className="mt-3 space-y-3">
            {displayScopes.map((scope) => {
              const meta = permissionMeta[scope];
              return (
                <div key={scope} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#2448b8] text-[#2448b8]">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold leading-5 text-[#374151]">
                        {meta
                          ? isArabic
                            ? meta.ar
                            : meta.en
                          : fallbackScopeLabel(scope)}
                      </p>
                      <code className="rounded-full bg-[#f0f2f5] px-2 py-0.5 text-[10px] font-bold text-[#667085]">
                        {scope}
                      </code>
                    </div>
                    <p className="mt-0.5 text-xs font-medium leading-5 text-[#667085]">
                      {meta
                        ? isArabic
                          ? meta.detailAr
                          : meta.detailEn
                        : scope}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {error ? (
            <p className="mt-4 rounded-[10px] bg-red-50 p-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#e4e7ec] bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="text-xs font-medium leading-5 text-[#667085]">
            {trustNote}
          </p>
          <div className="flex shrink-0 gap-3">
            <button
              type="button"
              onClick={() => submitConsent(false)}
              disabled={busy}
              className="inline-flex h-10 items-center justify-center rounded-[8px] border border-[#d0d5dd] bg-white px-4 text-sm font-bold text-[#344054] transition hover:bg-[#f8fafc] disabled:opacity-50"
            >
              {copy.cancel}
            </button>
            <button
              type="button"
              onClick={() => submitConsent(true)}
              disabled={
                busy || !organization?.id || resourceScopes.length === 0
              }
              className="inline-flex h-10 items-center justify-center rounded-[8px] bg-[#3246bd] px-4 text-sm font-bold text-white transition hover:bg-[#263aa3] disabled:opacity-50"
            >
              {approveLabel}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
