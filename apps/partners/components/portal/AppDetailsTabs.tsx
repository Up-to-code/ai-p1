"use client";

import { Code2, KeyRound, LayoutList } from "lucide-react";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/brand/StatusBadge";
import { cn } from "@/lib/utils";
import type { PartnerAppSummary } from "@/server/partnerApps";

type TabId = "overview" | "authorization" | "code";
type LanguageId = "typescript" | "javascript" | "curl";

const tabs: Array<{ id: TabId; label: string; icon: typeof LayoutList }> = [
  { id: "overview", label: "Overview", icon: LayoutList },
  { id: "authorization", label: "Authorization", icon: KeyRound },
  { id: "code", label: "Code", icon: Code2 },
];

const languages: Array<{ id: LanguageId; label: string }> = [
  { id: "typescript", label: "TypeScript" },
  { id: "javascript", label: "JavaScript" },
  { id: "curl", label: "cURL" },
];

function oauthAuthorizeUrl(app: PartnerAppSummary) {
  const redirectUri = app.redirectUris[0] ?? "https://partner.example.com/api/auth/anan/callback";
  return `GET /oauth/authorize
  ?client_id=${app.clientId}
  &response_type=code
  &redirect_uri=${encodeURIComponent(redirectUri)}
  &scope=${encodeURIComponent(app.allowedScopes.join(" "))}
  &code_challenge=<pkce-challenge>
  &code_challenge_method=S256`;
}

function codeFor(app: PartnerAppSummary, language: LanguageId) {
  const redirectUri = app.redirectUris[0] ?? "https://partner.example.com/api/auth/anan/callback";
  const scopes = app.allowedScopes.join(" ");

  if (language === "typescript") {
    return `type AnanOAuthConfig = {
  clientId: string;
  redirectUri: string;
  scopes: string[];
};

const config: AnanOAuthConfig = {
  clientId: "${app.clientId}",
  redirectUri: "${redirectUri}",
  scopes: ${JSON.stringify(app.allowedScopes, null, 2)},
};

const authorizeUrl = new URL("/oauth/authorize", process.env.ANAN_HUB_URL);
authorizeUrl.searchParams.set("client_id", config.clientId);
authorizeUrl.searchParams.set("response_type", "code");
authorizeUrl.searchParams.set("redirect_uri", config.redirectUri);
authorizeUrl.searchParams.set("scope", config.scopes.join(" "));
authorizeUrl.searchParams.set("code_challenge", pkce.challenge);
authorizeUrl.searchParams.set("code_challenge_method", "S256");`;
  }

  if (language === "javascript") {
    return `const authorizeUrl = new URL("/oauth/authorize", process.env.ANAN_HUB_URL);

authorizeUrl.searchParams.set("client_id", "${app.clientId}");
authorizeUrl.searchParams.set("response_type", "code");
authorizeUrl.searchParams.set("redirect_uri", "${redirectUri}");
authorizeUrl.searchParams.set("scope", "${scopes}");
authorizeUrl.searchParams.set("code_challenge", pkce.challenge);
authorizeUrl.searchParams.set("code_challenge_method", "S256");

return Response.redirect(authorizeUrl);`;
  }

  return `curl "https://hub.anan.example/oauth/authorize?client_id=${app.clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&code_challenge=<pkce-challenge>&code_challenge_method=S256"`;
}

export function AppDetailsTabs({ app }: { app: PartnerAppSummary }) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [language, setLanguage] = useState<LanguageId>("typescript");
  const selectedCode = useMemo(() => codeFor(app, language), [app, language]);

  return (
    <section className="rounded-[15px] border border-border bg-card">
      <div className="flex gap-1 overflow-x-auto border-b border-border p-2">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "inline-flex h-10 shrink-0 items-center gap-2 rounded-[7px] px-3 text-sm font-semibold transition-colors",
                active ? "bg-[#071A34] text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="p-5 md:p-6">
        {activeTab === "overview" ? (
          <div className="grid gap-4 lg:grid-cols-3">
            <InfoBlock label="Status" value={<StatusBadge status={app.status} />} />
            <InfoBlock label="Client type" value={app.clientType === "public" ? "Public PKCE app" : "Confidential server app"} />
            <InfoBlock label="Authorization lifetime" value={`${app.authorizationExpiresAfterDays} days`} />
            <InfoBlock label="Publisher" value={app.publisherName} />
            <InfoBlock label="Partner app URL" value={app.homepageUrl ?? "Not provided"} wide />
            <InfoBlock label="Hub sync" value={app.hubSyncStatus ?? "not_synced"} />
          </div>
        ) : null}

        {activeTab === "authorization" ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div>
              <h2 className="text-xl font-bold text-foreground">Authorization values</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Use these values in your app’s Anan authorization button and callback handler.
              </p>
              <div className="mt-5 space-y-3">
                <InfoBlock label="Client ID" value={app.clientId} />
                <InfoBlock label="Primary redirect URI" value={app.redirectUris[0] ?? "Not set"} />
                <InfoBlock label="Scopes" value={app.allowedScopes.join(", ")} />
              </div>
            </div>
            <pre className="overflow-x-auto rounded-[7px] bg-[#071A34] p-5 text-xs leading-6 text-slate-200">{oauthAuthorizeUrl(app)}</pre>
          </div>
        ) : null}

        {activeTab === "code" ? (
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Implementation starter</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Pick the closest shape for your backend. Keep token exchange and refresh on your server.
                </p>
              </div>
              <div className="flex rounded-[7px] border border-border bg-background p-1">
                {languages.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLanguage(item.id)}
                    className={cn(
                      "rounded-[4px] px-3 py-1.5 text-xs font-bold transition-colors",
                      language === item.id ? "bg-white text-foreground shadow-sm dark:bg-card" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <pre className="mt-5 overflow-x-auto rounded-[7px] bg-[#071A34] p-5 text-xs leading-6 text-slate-200">{selectedCode}</pre>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function InfoBlock({
  label,
  value,
  wide,
}: {
  label: string;
  value: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={cn("rounded-[7px] border border-border bg-background p-4", wide ? "lg:col-span-2" : "")}>
      <p className="text-[11px] font-bold uppercase text-muted-foreground">{label}</p>
      <div className="mt-2 break-words text-sm font-semibold leading-6 text-foreground">{value}</div>
    </div>
  );
}
