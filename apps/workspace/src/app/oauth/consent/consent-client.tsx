"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Building2,
  CheckCircle2,
  Home,
  KeyRound,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { getOAuthCopy } from "../oauth-copy";
import type { OAuthLocale } from "../oauth-locale";

type BetterAuthOrganization = { id: string; name: string };
type PartnerCatalogApp = {
  id?: string;
  name?: string;
  publisherName?: string;
  partnersClientId?: string;
};
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

const knownLocalApps: Record<string, PartnerCatalogApp> = {
  partners_client_j9d616X85tTR2oIEl59N94wk: {
    name: "Qentrah WhatsApp Services",
    publisherName: "Qentrah WhatsApp Services",
  },
};

const permissionMeta: Record<string, { icon: LucideIcon; en: string; ar: string; detailEn: string; detailAr: string }> = {
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
  "property:read": {
    icon: Home,
    en: "Properties",
    ar: "العقارات",
    detailEn: "Read property records and related listing details.",
    detailAr: "قراءة سجلات العقارات وتفاصيل العروض المرتبطة.",
  },
  offline_access: {
    icon: RefreshCw,
    en: "Refresh access",
    ar: "تجديد الوصول",
    detailEn: "Keep the integration connected without exposing tokens to the browser.",
    detailAr: "إبقاء التكامل متصلاً دون كشف الرموز للمتصفح.",
  },
};

function formatTemplate(value: string, replacements: Record<string, string>) {
  return Object.entries(replacements).reduce(
    (text, [key, replacement]) => text.replaceAll(`{${key}}`, replacement),
    value,
  );
}

function fallbackScopeLabel(scope: string) {
  return scope
    .split(":")
    .map((part) => part.replace(/[-_]/g, " "))
    .join(" ");
}

async function fetchPartnerApp(clientId: string) {
  const response = await fetch("/api/v1/integrations/partner-apps", { cache: "no-store" });
  if (!response.ok) return null;
  const payload = await response.json().catch(() => null) as { apps?: PartnerCatalogApp[] } | null;
  return payload?.apps?.find((app) => app.partnersClientId === clientId) ?? null;
}

export function OAuthConsentClient({ locale }: { locale: OAuthLocale }) {
  const copy = getOAuthCopy(locale);
  const activeOrganization = authClient.useActiveOrganization();
  const organization = activeOrganization.data as BetterAuthOrganization | null | undefined;
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [scopes] = useState<string[]>(() => scopesFromSearch());
  const [clientId] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("client_id") ?? "";
  });
  const [partnerApp, setPartnerApp] = useState<PartnerCatalogApp | null>(null);
  const isArabic = locale === "ar";
  const direction = isArabic ? "rtl" : "ltr";
  const displayScopes = scopes.filter((scope) => scope.includes(":") || scope === "offline_access");
  const resourceScopes = scopes.filter((scope) => scope.includes(":"));
  const organizationName = organization?.name ?? copy.fallbackOrganization;
  const appName = partnerApp?.name ?? (clientId ? knownLocalApps[clientId]?.name : undefined) ?? copy.fallbackApp;
  const consentTitle = formatTemplate(copy.consentTitle, { app: appName, organization: organizationName });
  const consentDescription = formatTemplate(copy.consentDescription, { app: appName, organization: organizationName });

  useEffect(() => {
    if (!clientId) return;
    let active = true;
    fetchPartnerApp(clientId)
      .then((app) => {
        if (active && app) setPartnerApp(app);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [clientId]);

  async function submitConsent(accept: boolean) {
    setBusy(true);
    setError("");
    try {
      if (accept && organization?.id) {
        if (!partnerApp?.id || !partnerApp.partnersClientId) throw new Error(copy.connectionError);
        const response = await fetch(`/api/v1/organizations/${encodeURIComponent(organization.id)}/partner-connections`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            partnersAppId: partnerApp.id,
            partnersClientId: partnerApp.partnersClientId,
            scopes: resourceScopes,
          }),
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
    <main
      dir={direction}
      className="flex min-h-screen items-center justify-center bg-[#f4f8fb] px-4 py-8 text-[#0f2633] sm:px-6"
    >
      <section className="w-full max-w-[680px] overflow-hidden rounded-[28px] border border-[#d8e3ea] bg-white shadow-[0_24px_80px_rgba(21,49,68,0.16)]">
        <div className="border-b border-[#dbe7ee] bg-[#f8fbfd] px-6 py-5 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white ring-1 ring-[#d7e4ec]">
                <Image src="/brand-logo-dark-blue.svg" alt="Qentrah" width={94} height={24} className="h-6 w-auto" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#557487]">{copy.eyebrow}</p>
                <p className="truncate text-sm font-bold text-[#18384a]">{copy.poweredBy}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 rounded-full bg-[#eaf3f7] px-3 py-2 text-xs font-black text-[#21475d]">
              <LockKeyhole className="h-4 w-4" aria-hidden="true" />
              <span>{copy.secureExchange}</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-7 sm:px-8 sm:py-8">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[#13384d] text-white shadow-[0_16px_36px_rgba(19,56,77,0.28)]">
              <KeyRound className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#6a8594]">{consentTitle}</p>
              <h1
                dir="ltr"
                className="mt-1 text-3xl font-black leading-tight tracking-normal text-[#0b1f2b] sm:text-4xl"
              >
                {appName}
              </h1>
              <p className="mt-3 text-base leading-7 text-[#587383]">{consentDescription}</p>
            </div>
          </div>

          <div className="mt-7 rounded-[22px] border border-[#dce8ef]">
            <div className="flex items-center justify-between gap-3 border-b border-[#dce8ef] px-5 py-4">
              <h2 className="text-sm font-black uppercase tracking-[0.14em] text-[#35596d]">{copy.permissionTitle}</h2>
              <ShieldCheck className="h-5 w-5 text-[#2c7890]" aria-hidden="true" />
            </div>
            <div className="divide-y divide-[#e4edf2]">
              {displayScopes.map((scope) => {
                const meta = permissionMeta[scope];
                const Icon = meta?.icon ?? CheckCircle2;
                return (
                  <div key={scope} className="flex items-start gap-4 px-5 py-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#eef6f9] text-[#23677d]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-black text-[#153344]">
                          {meta ? (isArabic ? meta.ar : meta.en) : fallbackScopeLabel(scope)}
                        </p>
                        <code className="rounded-full bg-[#f1f5f7] px-2 py-1 text-[11px] font-bold text-[#526c7b]">
                          {scope}
                        </code>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-[#617987]">
                        {meta ? (isArabic ? meta.detailAr : meta.detailEn) : scope}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="mt-5 flex items-start gap-2 text-sm leading-6 text-[#5f7887]">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#2c7890]" aria-hidden="true" />
            <span>{copy.trustNote}</span>
          </p>

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => submitConsent(false)}
              disabled={busy}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] border border-[#cbdbe4] px-5 text-sm font-black text-[#17384b] transition hover:bg-[#f3f7fa] disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" aria-hidden="true" />
              {copy.deny}
            </button>
            <button
              type="button"
              onClick={() => submitConsent(true)}
              disabled={busy || !organization?.id || resourceScopes.length === 0}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-[#0f3449] px-6 text-sm font-black text-white shadow-[0_14px_30px_rgba(15,52,73,0.28)] transition hover:bg-[#174a62] disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              {copy.authorize}
            </button>
          </div>
          {error ? <p className="mt-4 rounded-[16px] bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p> : null}
        </div>
      </section>
    </main>
  );
}
